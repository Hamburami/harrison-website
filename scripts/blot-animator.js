/**
 * MODULE: Blot Animation Controller
 * PURPOSE: Manages smooth animations and state transitions for the SDF blot
 * 
 * INPUTS:
 * - Blot state changes (idle, active, menu-expanded)
 * - Mouse position for movement targeting
 * - Time deltas for smooth interpolation
 * 
 * OUTPUTS:
 * - Coordinated animation sequences
 * - Smooth state transitions with easing
 * - Stable movement patterns that avoid mouse cursor
 * 
 * BEHAVIOR:
 * - Manages complex animation sequences using state machines
 * - Provides easing functions for natural motion
 * - Coordinates multiple animation layers (position, morph, breathing)
 */

class BlotAnimator {
    constructor(sdfBlot) {
        this.blot = sdfBlot;
        this.animationQueue = [];
        this.isAnimating = false;
        this.currentSequence = null;
        
        // Easing functions for natural motion
        this.easingFunctions = {
            linear: t => t,
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeOut: t => 1 - Math.pow(1 - t, 3),
            easeIn: t => t * t * t,
            elastic: t => {
                if (t === 0 || t === 1) return t;
                const p = 0.3;
                const s = p / 4;
                return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
            }
        };
        
        // Animation presets for different behaviors
        this.animationPresets = {
            idle: {
                breathingIntensity: 0.05,
                wiggleAmount: 2,
                pulseFrequency: 0.8
            },
            active: {
                breathingIntensity: 0.08,
                wiggleAmount: 4,
                pulseFrequency: 1.2
            },
            menuExpanded: {
                breathingIntensity: 0.03,
                wiggleAmount: 1,
                pulseFrequency: 0.6
            }
        };
    }

    /**
     * FUNCTION: createMoveSequence
     * PURPOSE: Generate smooth movement animation avoiding mouse cursor
     * INPUTS:
     *   - targetX, targetY: Destination coordinates
     *   - avoidX, avoidY: Mouse position to avoid
     *   - duration: Animation duration in milliseconds
     * OUTPUTS: Animation sequence object
     */
    createMoveSequence(targetX, targetY, avoidX, avoidY, duration = 1000) {
        const startX = this.blot.x;
        const startY = this.blot.y;
        
        // Calculate path that avoids mouse cursor
        const directDistance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const mouseDistance = Math.sqrt((avoidX - startX) ** 2 + (avoidY - startY) ** 2);
        
        let waypoints = [{ x: startX, y: startY }];
        
        // If path would cross near mouse, create waypoint to go around
        if (mouseDistance < 100 && directDistance > 50) {
            const avoidRadius = 120;
            const angle = Math.atan2(avoidY - startY, avoidX - startX);
            const perpAngle = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
            
            const waypointX = avoidX + Math.cos(perpAngle) * avoidRadius;
            const waypointY = avoidY + Math.sin(perpAngle) * avoidRadius;
            
            // Ensure waypoint is within bounds
            const boundedWaypointX = Math.max(60, Math.min(window.innerWidth - 60, waypointX));
            const boundedWaypointY = Math.max(60, Math.min(window.innerHeight - 60, waypointY));
            
            waypoints.push({ x: boundedWaypointX, y: boundedWaypointY });
        }
        
        waypoints.push({ x: targetX, y: targetY });
        
        return {
            type: 'move',
            waypoints: waypoints,
            duration: duration,
            easing: 'easeInOut',
            startTime: 0
        };
    }

    /**
     * FUNCTION: createMorphSequence
     * PURPOSE: Generate smooth morphing animation between states
     * INPUTS:
     *   - fromState: Starting blot state
     *   - toState: Target blot state
     *   - duration: Animation duration
     * OUTPUTS: Morph animation sequence
     */
    createMorphSequence(fromState, toState, duration = 800) {
        const morphValues = {
            idle: 0,
            active: 0.3,
            menuExpanded: 1.0
        };
        
        return {
            type: 'morph',
            fromValue: morphValues[fromState] || 0,
            toValue: morphValues[toState] || 0,
            duration: duration,
            easing: 'easeOut',
            startTime: 0
        };
    }

    /**
     * FUNCTION: createBreathingSequence
     * PURPOSE: Generate organic breathing animation
     * INPUTS:
     *   - intensity: Breathing strength (0-1)
     *   - frequency: Breathing rate
     * OUTPUTS: Continuous breathing animation
     */
    createBreathingSequence(intensity = 0.05, frequency = 0.8) {
        return {
            type: 'breathing',
            intensity: intensity,
            frequency: frequency,
            continuous: true
        };
    }

    /**
     * FUNCTION: queueAnimation
     * PURPOSE: Add animation to the queue for sequential playback
     * INPUTS:
     *   - sequence: Animation sequence object
     *   - priority: Animation priority (higher numbers play first)
     * OUTPUTS: Updated animation queue
     */
    queueAnimation(sequence, priority = 0) {
        sequence.priority = priority;
        this.animationQueue.push(sequence);
        this.animationQueue.sort((a, b) => b.priority - a.priority);
        
        if (!this.isAnimating) {
            this.playNextAnimation();
        }
    }

    /**
     * FUNCTION: playNextAnimation
     * PURPOSE: Execute the next animation in the queue
     * INPUTS: None
     * OUTPUTS: Started animation sequence
     */
    playNextAnimation() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.currentSequence = this.animationQueue.shift();
        this.currentSequence.startTime = Date.now();
        this.isAnimating = true;
    }

    /**
     * FUNCTION: update
     * PURPOSE: Update all active animations
     * INPUTS:
     *   - deltaTime: Time elapsed since last frame
     * OUTPUTS: Updated blot state
     */
    update(deltaTime) {
        if (!this.currentSequence) return;
        
        const elapsed = Date.now() - this.currentSequence.startTime;
        const progress = Math.min(elapsed / this.currentSequence.duration, 1);
        const easedProgress = this.easingFunctions[this.currentSequence.easing || 'linear'](progress);
        
        switch (this.currentSequence.type) {
            case 'move':
                this.updateMoveAnimation(easedProgress);
                break;
            case 'morph':
                this.updateMorphAnimation(easedProgress);
                break;
            case 'breathing':
                this.updateBreathingAnimation(deltaTime);
                break;
        }
        
        // Check if animation is complete
        if (progress >= 1 && !this.currentSequence.continuous) {
            this.currentSequence = null;
            this.playNextAnimation();
        }
    }

    /**
     * FUNCTION: updateMoveAnimation
     * PURPOSE: Update position along waypoint path
     * INPUTS:
     *   - progress: Animation progress (0-1)
     * OUTPUTS: Updated blot position
     */
    updateMoveAnimation(progress) {
        const waypoints = this.currentSequence.waypoints;
        if (waypoints.length < 2) return;
        
        // Calculate which segment we're on
        const segmentCount = waypoints.length - 1;
        const segmentProgress = progress * segmentCount;
        const segmentIndex = Math.floor(segmentProgress);
        const localProgress = segmentProgress - segmentIndex;
        
        if (segmentIndex >= segmentCount) {
            // Animation complete - set final position
            const final = waypoints[waypoints.length - 1];
            this.blot.moveTo(final.x, final.y);
            return;
        }
        
        // Interpolate between current and next waypoint
        const current = waypoints[segmentIndex];
        const next = waypoints[segmentIndex + 1];
        
        const x = current.x + (next.x - current.x) * localProgress;
        const y = current.y + (next.y - current.y) * localProgress;
        
        this.blot.moveTo(x, y);
    }

    /**
     * FUNCTION: updateMorphAnimation
     * PURPOSE: Update blot morph factor
     * INPUTS:
     *   - progress: Animation progress (0-1)
     * OUTPUTS: Updated morph factor
     */
    updateMorphAnimation(progress) {
        const from = this.currentSequence.fromValue;
        const to = this.currentSequence.toValue;
        const morphValue = from + (to - from) * progress;
        
        this.blot.morphFactor = morphValue;
    }

    /**
     * FUNCTION: updateBreathingAnimation
     * PURPOSE: Update continuous breathing effect
     * INPUTS:
     *   - deltaTime: Time elapsed
     * OUTPUTS: Updated breathing parameters
     */
    updateBreathingAnimation(deltaTime) {
        // This is handled by the SDF blot's internal breathing system
        // The animator just manages the intensity
        const intensity = this.currentSequence.intensity;
        this.blot.breathingIntensity = intensity;
    }

    /**
     * FUNCTION: transitionToState
     * PURPOSE: Smoothly transition to a new blot state
     * INPUTS:
     *   - newState: Target state ('idle', 'active', 'menuExpanded')
     *   - targetX, targetY: Optional target position
     *   - avoidX, avoidY: Mouse position to avoid
     * OUTPUTS: Queued animation sequences
     */
    transitionToState(newState, targetX = null, targetY = null, avoidX = 0, avoidY = 0) {
        const currentState = this.blot.state;
        
        // Queue morph animation
        const morphSeq = this.createMorphSequence(currentState, newState, 600);
        this.queueAnimation(morphSeq, 10);
        
        // Queue movement if target specified
        if (targetX !== null && targetY !== null) {
            const moveSeq = this.createMoveSequence(targetX, targetY, avoidX, avoidY, 800);
            this.queueAnimation(moveSeq, 9);
        }
        
        // Update blot state
        this.blot.setState(newState);
        
        // Apply animation preset
        const preset = this.animationPresets[newState];
        if (preset) {
            const breathingSeq = this.createBreathingSequence(preset.breathingIntensity, preset.pulseFrequency);
            this.queueAnimation(breathingSeq, 1);
        }
    }

    /**
     * FUNCTION: emergencyStop
     * PURPOSE: Immediately stop all animations
     * INPUTS: None
     * OUTPUTS: Cleared animation state
     */
    emergencyStop() {
        this.animationQueue = [];
        this.currentSequence = null;
        this.isAnimating = false;
    }

    /**
     * FUNCTION: isMoving
     * PURPOSE: Check if blot is currently moving
     * INPUTS: None
     * OUTPUTS: Boolean indicating movement state
     */
    isMoving() {
        return this.currentSequence && this.currentSequence.type === 'move';
    }
}

// Export for use in main application
window.BlotAnimator = BlotAnimator;
