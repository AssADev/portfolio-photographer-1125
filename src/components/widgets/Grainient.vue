<script setup lang="ts">
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import fragment from '#components/widgets/shaders/grainient.fs?raw';
import vertex from '#components/widgets/shaders/grainient.vs?raw';

import colors from '#styles/modules/colors.module.scss';

interface GrainientProps {
	timeSpeed?: number;
	colorBalance?: number;
	warpStrength?: number;
	warpFrequency?: number;
	warpSpeed?: number;
	warpAmplitude?: number;
	blendAngle?: number;
	blendSoftness?: number;
	rotationAmount?: number;
	noiseScale?: number;
	grainAmount?: number;
	grainScale?: number;
	grainAnimated?: boolean;
	contrast?: number;
	gamma?: number;
	saturation?: number;
	centerX?: number;
	centerY?: number;
	zoom?: number;
	color1?: string;
	color2?: string;
	color3?: string;
	className?: string;
}

// Refs :
const props = withDefaults(defineProps<GrainientProps>(), {
	timeSpeed: 0.25,
	colorBalance: 0.0,
	warpStrength: 1.0,
	warpFrequency: 7.0,
	warpSpeed: 2.0,
	warpAmplitude: 50.0,
	blendAngle: 0.0,
	blendSoftness: 0.05,
	rotationAmount: 450.0,
	noiseScale: 2.0,
	grainAmount: 0.1,
	grainScale: 2.0,
	grainAnimated: false,
	contrast: 1.5,
	gamma: 1.0,
	saturation: 1.0,
	centerX: 0.0,
	centerY: 0.0,
	zoom: 0.9,
	color1: colors.dust,
	color2: colors.white,
	color3: colors.dust,
	className: ''
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

let raf = 0;
let gl: any;
let renderer: Renderer;
let program: Program;

// Methods :
const hexToRgb = (hex: string): [number, number, number] => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return [1, 1, 1];
	return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const setSize = () => {
	if (!canvasRef.value || !renderer) return;

	const width = window.innerWidth;
	const height = window.innerHeight;

	renderer.setSize(width, height);

	if (program) {
		const res = (program.uniforms.iResolution as { value: Float32Array }).value;
		res[0] = gl.drawingBufferWidth;
		res[1] = gl.drawingBufferHeight;
	}
};

// Attach & Detach :
onMounted(() => {
	if (!canvasRef.value) return;

	renderer = new Renderer({
		canvas: canvasRef.value,
		webgl: 2,
		alpha: true,
		antialias: false,
		dpr: Math.min(window.devicePixelRatio || 1, 2)
	});

	gl = renderer.gl;

	const geometry = new Triangle(gl);
	program = new Program(gl, {
		vertex,
		fragment,
		uniforms: {
			iTime: { value: 0 },
			iResolution: { value: new Float32Array([1, 1]) },
			uTimeSpeed: { value: props.timeSpeed },
			uColorBalance: { value: props.colorBalance },
			uWarpStrength: { value: props.warpStrength },
			uWarpFrequency: { value: props.warpFrequency },
			uWarpSpeed: { value: props.warpSpeed },
			uWarpAmplitude: { value: props.warpAmplitude },
			uBlendAngle: { value: props.blendAngle },
			uBlendSoftness: { value: props.blendSoftness },
			uRotationAmount: { value: props.rotationAmount },
			uNoiseScale: { value: props.noiseScale },
			uGrainAmount: { value: props.grainAmount },
			uGrainScale: { value: props.grainScale },
			uGrainAnimated: { value: props.grainAnimated ? 1.0 : 0.0 },
			uContrast: { value: props.contrast },
			uGamma: { value: props.gamma },
			uSaturation: { value: props.saturation },
			uCenterOffset: { value: new Float32Array([props.centerX, props.centerY]) },
			uZoom: { value: props.zoom },
			uColor1: { value: new Float32Array(hexToRgb(props.color1)) },
			uColor2: { value: new Float32Array(hexToRgb(props.color2)) },
			uColor3: { value: new Float32Array(hexToRgb(props.color3)) }
		}
	});

	const mesh = new Mesh(gl, { geometry, program });

	window.addEventListener('resize', setSize);
	setSize();

	const t0 = performance.now();
	const loop = (t: number) => {
		(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;
		renderer.render({ scene: mesh });
		raf = requestAnimationFrame(loop);
	};
	raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
	cancelAnimationFrame(raf);
	window.removeEventListener('resize', setSize);
});
</script>

<template>
	<canvas ref="canvasRef" :class="['grainient-canvas', className]" />
</template>

<style lang="scss" scoped>
.grainient-canvas {
	position: fixed;
	inset: 0;
	z-index: -1;
	pointer-events: none;
}
</style>
