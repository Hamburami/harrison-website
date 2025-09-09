/**
 * MODULE: SDF Blot System
 * PURPOSE: Creates organic ink blot shapes using Signed Distance Fields with smooth minimum operations
 * 
 * INPUTS:
 * - Canvas context for rendering
 * - Time parameter for animations
 * - Blot state (idle, active, menu-expanded)
 * - Target position for movement
 * 
 * OUTPUTS:
 * - Rendered organic blot shape on canvas
 * - Smooth morphing animations between states
 * - Stable movement with fluid transitions
 * 
 * ARCHITECTURE:
 * This module implements Inigo Quilez's smooth minimum techniques to create
 * organic shapes by blending multiple SDF primitives. Each function is
 * documented with clear input/output specifications for future maintainability.
 */

class SDFBlot {
    constructor(canvas, initialX = 0, initialY = 0) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = initialX;
        this.y = initialY;
        this.targetX = initialX;
        this.targetY = initialY;
        this.time = 0;
        this.state = 'idle'; // idle, active, menu-expanded
        this.animationSpeed = 0.02;
        this.morphFactor = 0;
        this.targetMorphFactor = 0;
        
        // Animation parameters for organic movement
        this.breathingPhase = 0;
        this.pulsePhase = 0;
        this.wigglePhase = 0;
        
        this.setupCanvas();
    }

    /**
     * FUNCTION: setupCanvas
     * PURPOSE: Initialize canvas with proper sizing and pixel density
     * INPUTS: None (uses instance canvas)
     * OUTPUTS: Configured canvas ready for SDF rendering
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * FUNCTION: sminQuadratic
     * PURPOSE: Quadratic polynomial smooth minimum (fastest, most stable)
     * INPUTS: 
     *   - a: First SDF value
     *   - b: Second SDF value  
     *   - k: Blending radius (normalized)
     * OUTPUTS: Smoothly blended minimum value
     * 
     * This is the normalized quadratic smooth-minimum from Quilez's article.
     * It's conservative (never overestimates) and perfect for real-time rendering.
     */
    sminQuadratic(a, b, k) {
        k *= 4.0;
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - h * h * k * (1.0 / 4.0);
    }

    /**
     * FUNCTION: sminCubic
     * PURPOSE: Cubic polynomial smooth minimum (smoother transitions)
     * INPUTS: Same as sminQuadratic
     * OUTPUTS: Smoothly blended minimum with cubic curve
     * 
     * Provides smoother blending than quadratic at slight performance cost.
     * Still conservative and suitable for organic shapes.
     */
    sminCubic(a, b, k) {
        k *= 6.0;
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - h * h * h * k * (1.0 / 6.0);
    }

    /**
     * FUNCTION: sminCircular
     * PURPOSE: Circular smooth minimum (perfect circular blends)
     * INPUTS: Same as sminQuadratic
     * OUTPUTS: Smoothly blended minimum with circular profile
     * 
     * Creates perfectly circular connections between perpendicular shapes.
     * More expensive but creates the most organic-looking blends.
     */
    sminCircular(a, b, k) {
        k *= 1.0 / (1.0 - Math.sqrt(0.5));
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - k * 0.5 * (1.0 + h - Math.sqrt(1.0 - h * (h - 2.0)));
    }

    /**
     * FUNCTION: sdCircle
     * PURPOSE: Signed distance to a circle
     * INPUTS:
     *   - px, py: Point coordinates
     *   - cx, cy: Circle center
     *   - radius: Circle radius
     * OUTPUTS: Signed distance (negative inside, positive outside)
     */
    sdCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        return Math.sqrt(dx * dx + dy * dy) - radius;
    }

    /**
     * FUNCTION: sdEllipse
     * PURPOSE: Signed distance to an ellipse
     * INPUTS:
     *   - px, py: Point coordinates
     *   - cx, cy: Ellipse center
     *   - rx, ry: Ellipse radii
     * OUTPUTS: Signed distance to ellipse
     */
    sdEllipse(px, py, cx, cy, rx, ry) {
        const dx = Math.abs(px - cx);
        const dy = Math.abs(py - cy);
        
        // Simplified ellipse SDF approximation for performance
        const a = rx;
        const b = ry;
        const x = dx / a;
        const y = dy / b;
        
        return (a * b) * (Math.sqrt(x * x + y * y) - 1.0) / Math.sqrt(a * a * y * y + b * b * x * x);
    }

    /**
     * FUNCTION: createBlotSDF
     * PURPOSE: Generate the complete blot shape using multiple SDF primitives
     * INPUTS:
     *   - px, py: Sample point coordinates
     *   - time: Animation time parameter
     *   - morphFactor: Blend between different states (0-1)
     * OUTPUTS: Signed distance to the complete blot shape
     * 
     * This is the main shape function that combines multiple primitives
     * using smooth minimum operations to create an organic ink blot.
     */
    createBlotSDF(px, py, time, morphFactor) {
        // Base body - main ellipse with breathing animation
        const breathingScale = 1.0 + 0.1 * Math.sin(time * 2.0 + this.breathingPhase);
        const bodyRadius = 25 * breathingScale;
        const bodyHeight = 30 * breathingScale;
        const mainBody = this.sdEllipse(px, py, this.x, this.y, bodyRadius, bodyHeight);

        // Secondary blob for asymmetry
        const blob2X = this.x + 15 * Math.cos(time * 1.5);
        const blob2Y = this.y + 10 * Math.sin(time * 1.2);
        const blob2Radius = 18 + 5 * Math.sin(time * 3.0);
        const secondaryBlob = this.sdCircle(px, py, blob2X, blob2Y, blob2Radius);

        // Tertiary blob for more organic shape
        const blob3X = this.x - 12 * Math.cos(time * 0.8);
        const blob3Y = this.y - 8 * Math.sin(time * 1.8);
        const blob3Radius = 12 + 3 * Math.cos(time * 2.5);
        const tertiaryBlob = this.sdCircle(px, py, blob3X, blob3Y, blob3Radius);

        // Combine using smooth minimums for organic blending
        let combined = this.sminCubic(mainBody, secondaryBlob, 15);
        combined = this.sminQuadratic(combined, tertiaryBlob, 12);

        // Add menu expansion morphing
        if (morphFactor > 0) {
            // Create expanded menu shape
            const menuRadius = 45 + 10 * morphFactor;
            const menuShape = this.sdCircle(px, py, this.x, this.y, menuRadius);
            
            // Blend between normal and menu states
            combined = combined * (1 - morphFactor) + menuShape * morphFactor;
        }

        // Add subtle surface details
        const detailNoise = 2 * Math.sin(px * 0.1 + time) * Math.cos(py * 0.1 + time * 1.3);
        combined += detailNoise * 0.5;

        return combined;
    }

    /**
     * FUNCTION: renderBlot
     * PURPOSE: Render the blot to canvas using SDF raymarching technique
     * INPUTS: None (uses instance state)
     * OUTPUTS: Rendered blot on canvas
     * 
     * Uses a simplified 2D raymarching approach to render the SDF.
     * Samples the SDF at each pixel to determine inside/outside.
     */
    renderBlot() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Sample SDF at each pixel
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const distance = this.createBlotSDF(x, y, this.time, this.morphFactor);
                const index = (y * this.canvas.width + x) * 4;
                
                if (distance < 0) {
                    // Inside the blot - create gradient effect
                    const intensity = Math.max(0, 1 + distance / 20);
                    const r = Math.floor(44 * intensity);   // #2c1810 base color
                    const g = Math.floor(24 * intensity);
                    const b = Math.floor(16 * intensity);
                    
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;
                } else {
                    // Outside - transparent
                    data[index + 3] = 0;
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * FUNCTION: update
     * PURPOSE: Update animation state and position
     * INPUTS: 
     *   - deltaTime: Time elapsed since last frame
     * OUTPUTS: Updated internal state for next render
     */
    update(deltaTime) {
        this.time += deltaTime * this.animationSpeed;
        
        // Smooth position interpolation
        const moveSpeed = 0.08;
        this.x += (this.targetX - this.x) * moveSpeed;
        this.y += (this.targetY - this.y) * moveSpeed;
        
        // Smooth morph factor interpolation
        const morphSpeed = 0.1;
        this.morphFactor += (this.targetMorphFactor - this.morphFactor) * morphSpeed;
        
        // Update animation phases for variety
        this.breathingPhase += deltaTime * 0.001;
        this.pulsePhase += deltaTime * 0.002;
        this.wigglePhase += deltaTime * 0.0015;
    }

    /**
     * FUNCTION: setState
     * PURPOSE: Change blot state with smooth transitions
     * INPUTS:
     *   - newState: 'idle', 'active', or 'menu-expanded'
     * OUTPUTS: Updated target morph factor for smooth transition
     */
    setState(newState) {
        this.state = newState;
        
        switch (newState) {
            case 'idle':
                this.targetMorphFactor = 0;
                break;
            case 'active':
                this.targetMorphFactor = 0.3;
                break;
            case 'menu-expanded':
                this.targetMorphFactor = 1.0;
                break;
        }
    }

    /**
     * FUNCTION: moveTo
     * PURPOSE: Set target position for smooth movement
     * INPUTS:
     *   - x, y: Target coordinates
     * OUTPUTS: Updated target position
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * FUNCTION: isPointInside
     * PURPOSE: Test if a point is inside the blot shape
     * INPUTS:
     *   - px, py: Point coordinates to test
     * OUTPUTS: Boolean - true if point is inside blot
     */
    isPointInside(px, py) {
        return this.createBlotSDF(px, py, this.time, this.morphFactor) < 0;
    }
}

// Export for use in main application
window.SDFBlot = SDFBlot;
