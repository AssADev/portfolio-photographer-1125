export const VideoRegex = /\.(mp4|mov|avi|wmv|flv|mkv)$/i;

export const VideoCodecMapping: Record<string, string> = {
	av1: 'video/webm; codecs=av01.2.08H.12',
	h265: 'video/mp4; codecs=hvc1',
	h264: 'video/mp4',
	mp4: 'video/mp4',
	webm: 'video/webm'
};
