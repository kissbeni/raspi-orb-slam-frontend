import classes from './camera-widget.module.css';
import { CircularProgress } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppWidget from '../../app-widget/app-widget';
import CenteringBox from '../../centering-box/centering-box';
import { Point3D } from '../../../common/common-types';
import { mat4 } from 'gl-matrix';

export type PointCloudWidgetParams = {
  path: Point3D[];
  worldPoints: Point3D[];
};

type ExtendedWindowType = Window & {
  lastFrameUpdate: Date;
};

// Vertex shader
const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uColor;
uniform float uPointSize;

varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  gl_PointSize = uPointSize;
  vColor = uColor;
}
`;

// Fragment shader
const fsSource = `
varying lowp vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;

const loadShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);

  if (shader === null) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const initShaderProgram = (gl: WebGLRenderingContext, vsSource: string, fsSource: string) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (vertexShader === null || fragmentShader === null) return null;

  const shaderProgram = gl.createProgram();

  if (shaderProgram === null) {
    return null;
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
};

export const PointCloudWidget = (params: PointCloudWidgetParams) => {
  //const [loading, setLoading] = useState(true);
  //const [streamUrl, setStreamUrl] = useState(params.streamUrl);

  //const _window = window as unknown as ExtendedWindowType;
  //_window.lastFrameUpdate = new Date();

  const canvasProc: React.ReactEventHandler<HTMLCanvasElement> = useCallback((e) => {
    console.log(e);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('pointCloudCanvas') as HTMLCanvasElement;
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (gl === null) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (shaderProgram === null) return;

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        color: gl.getUniformLocation(shaderProgram, 'uColor'),
        pointSize: gl.getUniformLocation(shaderProgram, 'uPointSize'),
      },
    };

    /*console.log(
      params.worldPoints.reduce<number[]>((acc, cur) => [...acc, cur.x, cur.y, cur.z], [])
    );*/

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        params.worldPoints
          .concat(params.path)
          .reduce<number[]>((acc, cur) => [...acc, cur.x, cur.y, cur.z], [])
      ),
      gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.useProgram(programInfo.program);

    const lastPointInTrajectory = params.path[params.path.length - 1] ?? { x: 0, y: 0, z: 0 };
    //console.log(lastPointInTrajectory);

    const drawScene = () => {
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0); // Clear everything
      gl.enable(gl.DEPTH_TEST); // Enable depth testing
      gl.depthFunc(gl.LEQUAL); // Near things obscure far things
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const fieldOfView = (45 * Math.PI) / 180; // in radians
      const aspect = canvas.clientWidth / canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = mat4.create();

      // note: glmatrix.js always has the first argument
      // as the destination to receive the result.
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

      const modelViewMatrix = mat4.create();
      mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [0, 0, -5]
      );
      mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-lastPointInTrajectory.x, -lastPointInTrajectory.y, -lastPointInTrajectory.z]
      );

      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
      gl.uniform4f(programInfo.uniformLocations.color, 1, 1, 1, 1);
      gl.uniform1f(programInfo.uniformLocations.pointSize, 3);
      gl.drawArrays(gl.POINTS, 0, params.worldPoints.length);

      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
      gl.uniform4f(programInfo.uniformLocations.color, 0, 1, 0, 1);
      gl.uniform1f(programInfo.uniformLocations.pointSize, 5);
      gl.drawArrays(gl.POINTS, params.worldPoints.length, params.path.length);
      gl.uniform4f(programInfo.uniformLocations.color, 1, 1, 0, 1);
      gl.drawArrays(gl.LINE_STRIP, params.worldPoints.length, params.path.length);
    };

    drawScene();
  }, [params]);

  return (
    <div>
      <AppWidget title="Point cloud and camera trajectory">
        <canvas id="pointCloudCanvas" width="640" height="480"></canvas>
      </AppWidget>
    </div>
  );
};

export default PointCloudWidget;
