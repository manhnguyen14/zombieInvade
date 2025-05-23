import { Component } from '../component.js';

export class PlayerComponent extends Component {
    constructor() {
        super('player');
        // Soldiers in the team (array of soldier entity IDs)
        this.soldiers = [];
        // Soldiers organized by lane
        this.soldiersByLane = {};
        // Soldiers organized by position
        this.soldiersByPosition = {
            middle: [],
            top: [],
            bottom: []
        };
        // Grenades inventory
        this.grenades = {
            standard: 0,
            sticky: 0
        };
        // Grenade properties
        this.grenadeProperties = {
            standard: {
                damage: 5,
                radius: 50,
                speed: 200,
                color: '#ff4500',
                width: 12,
                height: 12
            },
            sticky: {
                damage: 1,
                radius: 50,
                speed: 180,
                color: '#00ff00',
                width: 12,
                height: 12,
                slowFactor: 0.5,
                duration: 5
            }
        };
    }
} 