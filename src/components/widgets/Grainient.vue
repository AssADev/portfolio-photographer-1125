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
	mouseRadius?: number;
	mouseStrength?: number;
	colorIntensity?: number;
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
	className: '',
	mouseRadius: 0.4,
	mouseStrength: 1.0,
	colorIntensity: 0.4
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

// The gradient moves very slowly, so 30fps is enough (it halves the GPU usage, or more on 120Hz screens) :
const FRAME_INTERVAL = 1000 / 30;

let raf = 0;
let gl: any;
let renderer: Renderer;
let program: Program;
let lastWidth = 0;
let lastHeight = 0;
let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

// Cursor interaction (desktop only) : the target is set on pointer events, then eased every frame
// so the sand drags and settles smoothly instead of snapping to the cursor :
const MOUSE_EASE = 0.08;
const INFLUENCE_EASE = 0.06;
let isDesktopPointer = false;
const mouseTarget = { x: 0.5, y: 0.5 };
const mouseSmooth = { x: 0.5, y: 0.5 };
const mousePrevSmooth = { x: 0.5, y: 0.5 };
let mouseInfluence = 0;
let mouseInfluenceTarget = 0;

const onPointerMove = (e: PointerEvent) => {
	if (e.pointerType !== 'mouse') return;
	mouseTarget.x = e.clientX / window.innerWidth;
	mouseTarget.y = 1.0 - e.clientY / window.innerHeight;
	mouseInfluenceTarget = 1;
};

const onPointerLeave = () => {
	mouseInfluenceTarget = 0;
};

// Methods :
const hexToRgb = (hex: string): [number, number, number] => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return [1, 1, 1];
	return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const setSize = () => {
	const canvas = canvasRef.value;
	if (!canvas || !renderer) return;

	// The canvas is sized in CSS (it covers the largest viewport), its resolution follows its size :
	canvas.style.removeProperty('width');
	canvas.style.removeProperty('height');

	lastWidth = window.innerWidth;
	lastHeight = window.innerHeight;

	renderer.setSize(canvas.clientWidth || lastWidth, canvas.clientHeight || lastHeight);

	canvas.style.removeProperty('width');
	canvas.style.removeProperty('height');

	if (program) {
		const res = (program.uniforms.iResolution as { value: Float32Array }).value;
		res[0] = gl.drawingBufferWidth;
		res[1] = gl.drawingBufferHeight;
	}
};

const onResize = () => {
	// On mobile, the address bar changes the height while scrolling : resizing the canvas would clear it (flickering)
	// and cost a lot, so only the width changes (e.g. rotation) and the big height changes are handled :
	const heightDelta = Math.abs(window.innerHeight - lastHeight) / (lastHeight || 1);
	if (window.innerWidth === lastWidth && heightDelta < 0.25) return;

	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(setSize, 150);
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
			uColor3: { value: new Float32Array(hexToRgb(props.color3)) },
			uMouse: { value: new Float32Array([0.5, 0.5]) },
			uMouseVelocity: { value: new Float32Array([0, 0]) },
			uMouseInfluence: { value: 0 },
			uMouseRadius: { value: props.mouseRadius },
			uMouseStrength: { value: props.mouseStrength },
			uColorIntensity: { value: props.colorIntensity }
		}
	});

	const mesh = new Mesh(gl, { geometry, program });

	window.addEventListener('resize', onResize);
	setSize();

	// The pointer can be tracked fluidly only on devices with a real mouse (no touch, no hover-less trackpads) :
	isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (isDesktopPointer) {
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave);
		window.addEventListener('blur', onPointerLeave);
	}

	// Reduced motion : a single (static) frame is rendered :
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		renderer.render({ scene: mesh });
		return;
	}

	const t0 = performance.now();
	let lastRender = -Infinity;

	const loop = (t: number) => {
		raf = requestAnimationFrame(loop);

		if (t - lastRender < FRAME_INTERVAL) return;
		lastRender = t;

		(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;

		if (isDesktopPointer) {
			mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * MOUSE_EASE;
			mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * MOUSE_EASE;
			mouseInfluence += (mouseInfluenceTarget - mouseInfluence) * INFLUENCE_EASE;

			const mouse = (program.uniforms.uMouse as { value: Float32Array }).value;
			mouse[0] = mouseSmooth.x;
			mouse[1] = mouseSmooth.y;

			const velocity = (program.uniforms.uMouseVelocity as { value: Float32Array }).value;
			velocity[0] = mouseSmooth.x - mousePrevSmooth.x;
			velocity[1] = mouseSmooth.y - mousePrevSmooth.y;
			mousePrevSmooth.x = mouseSmooth.x;
			mousePrevSmooth.y = mouseSmooth.y;

			(program.uniforms.uMouseInfluence as { value: number }).value = mouseInfluence;
		}

		renderer.render({ scene: mesh });
	};
	raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
	cancelAnimationFrame(raf);
	clearTimeout(resizeTimeout);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerleave', onPointerLeave);
	window.removeEventListener('blur', onPointerLeave);
	gl?.getExtension('WEBGL_lose_context')?.loseContext();
});
</script>

<template>
	<canvas ref="canvasRef" :class="['grainient-canvas', className]" />
</template>

<style lang="scss" scoped>
.grainient-canvas {
	@include lvh(100);

	position: fixed;
	top: 0;
	left: 0;
	z-index: -1;
	width: 100%;
	pointer-events: none;
}
</style>
