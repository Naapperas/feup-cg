import {
    CGFscene,
    CGFcamera,
    CGFaxis,
    CGFappearance,
    CGFtexture,
} from "../lib/CGF.js";
import { MyBird } from "./MyBird.js";
import { MyBirdEgg } from "./MyBirdEgg.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyTerrain } from "./MyTerrain.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);

        // initialize this early because the camera needs it to set its initial position
        this.bird = new MyBird(this);
        this.birdInitialYPos = this.bird.yPos;

        this.initCameras();
        this.initLights();

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        //Initialize scene objects
        this.axis = new CGFaxis(this);
        this.terrain = new MyTerrain(
            this,
            128,
            0.2,
            new CGFtexture(this, "images/terrain.jpg"),
            new CGFtexture(this, "images/heightmap.jpg"),
            new CGFtexture(this, "images/altimetry.png")
        );
        this.panorama = new MyPanorama(
            this,
            new CGFtexture(this, "images/panorama4.jpg")
        );
        this.egg = new MyBirdEgg(this, 20, 20);

        //Objects connected to MyInterface
        this.displayAxis = true;
        this.scaleFactor = 1;

        this.enableTextures(true);

        this.appearance = new CGFappearance(this);

        this.enableNormalViz = false;

        this.setUpdatePeriod(50);
        this.lastUpdateTime = -1;

        this.appStartTime = Date.now();
    }

    checkKeys(delta) {
        if (this.gui.isKeyPressed("KeyW")) {
            this.bird.zPos += this.bird.birdSpeed * delta * 0.5;
            this.camera.moveForward(this.bird.birdSpeed * delta * 0.5);
        }
    }

    initLights() {
        this.lights[0].setPosition(15, 0, 5, 1);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].enable();
        this.lights[0].update();
    }

    initCameras() {
        this.camera = new CGFcamera(
            1.0,
            0.1,
            1000,
            vec3.fromValues(this.bird.xPos, this.bird.yPos + 10, this.bird.zPos - 15),
            vec3.fromValues(this.bird.xPos, this.birdInitialYPos, this.bird.zPos)
        );
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    update(time) {

        if (this.lastUpdateTime == -1) {
            this.lastUpdateTime = time;
        } else {

            const delta = (time - this.lastUpdateTime) / 1000.0;

            this.checkKeys(delta);
            this.lastUpdateTime = time;
        }

        const timeSinceAppStart = (time - this.appStartTime) / 1000.0;

        this.bird.update(timeSinceAppStart);
        // this.camera.setPosition([this.bird.xPos, this.bird.yPos + 10, this.bird.zPos - 15]);
        this.camera.setTarget([this.bird.xPos, this.birdInitialYPos, this.bird.zPos]);

        super.update();
    }

    display() {
        // ---- BEGIN Background, camera and axis setup
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();
        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        // Draw axis
        if (this.displayAxis) this.axis.display();
        if (this.enableNormalViz) {
            this.bird.enableNormalViz();
        } else {
            this.bird.disableNormalViz();
        }
        // ---- BEGIN Primitive drawing section

        this.panorama.display();
        this.bird.display();

        this.pushMatrix();
        this.translate(0, -100, 0);
        this.scale(400, 400, 400);
        this.rotate(-Math.PI / 2.0, 1, 0, 0);
        this.terrain.display();
        this.popMatrix();

        // ---- END Primitive drawing section
    }
}
