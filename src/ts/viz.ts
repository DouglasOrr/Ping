/**
 * Debug rendering of the map.
 */

import * as core from "./core.js";

export class Renderer {
    readonly ctx: CanvasRenderingContext2D
    readonly background: ImageData

    constructor(canvas: HTMLCanvasElement, readonly map: core.GameMap, readonly scale: number) {
        canvas.width = scale * map.width;
        canvas.height = scale * map.height;
        this.ctx = canvas.getContext("2d");
        // Pre-render the background image
        this.background = this.ctx.createImageData(scale * map.width, scale * map.height);
        const data = this.background.data;
        const cellTypeToGrayscale = [255, 0, 192];
        // Manually scale the image up - not pretty!
        for (let y = 0; y < map.width; ++y) {
            for (let x = 0; x < map.width; ++x) {
                const gray = cellTypeToGrayscale[map.cells[y * map.width + x]];
                for (let yy = 0; yy < scale; ++yy) {
                    for (let xx = 0; xx < scale; ++xx) {
                        const idx = map.width * scale * (scale * y + yy) + scale * x + xx;
                        data[4 * idx + 0] = gray
                        data[4 * idx + 1] = gray;
                        data[4 * idx + 2] = gray;
                        data[4 * idx + 3] = 255;
                    }
                }
            }
        }
    }

    draw(ship: core.Ship): void {
        // Background
        this.ctx.putImageData(this.background, 0, 0);

        // Transform
        this.ctx.resetTransform();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(.5, .5);

        // Breadcrumbs
        this.ctx.strokeStyle = "#ff0000";
        this.ctx.lineWidth = .5 / this.scale;
        this.ctx.beginPath();
        this.ctx.moveTo(this.map.start[0], this.map.start[1]);
        for (const breadcrumb of this.map.breadcrumbs) {
            this.ctx.lineTo(breadcrumb[0], breadcrumb[1]);
        }
        this.ctx.stroke();

        // Ship
        this.ctx.beginPath();
        this.ctx.arc(ship.position[0], ship.position[1], core.ShipRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fill();
        const shipFrontAngle = 0.25 * Math.PI;
        this.ctx.beginPath();
        this.ctx.moveTo(ship.position[0], ship.position[1]);
        this.ctx.arc(ship.position[0], ship.position[1], core.ShipRadius + 0.25,
            Math.PI / 2 - shipFrontAngle + ship.bearing,
            Math.PI / 2 + shipFrontAngle + ship.bearing);
        this.ctx.fillStyle = "#0000ff";
        this.ctx.fill();
    }
}
