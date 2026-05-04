import { ParticipantEvent, RoomEvent, VideoQuality, isVideoTrack } from "livekit-client";
import * as React from "react";


const defaultOptions = {
    reducePublisherVideoQuality: true,
    reduceSubscriberVideoQuality: true,
    disableVideoProcessing: false,
};

/**
 * This hook ensures that on devices with low CPU, the performance is optimised when needed.
 * This is done by primarily reducing the video quality to low when the CPU is constrained.
 */
export function useLowCPUOptimizer(room, options = {}) {
	const [lowPowerMode, setLowPowerMode] = React.useState(false);
	const opts = React.useMemo(() => ({ ...defaultOptions, ...options }), [options]);
	React.useEffect(() => {
		const handleCpuConstrained = async (track) => {
			setLowPowerMode(true);
			console.warn("Local track CPU constrained", track);
			if (opts.reducePublisherVideoQuality) {
				track.prioritizePerformance();
			}
			if (opts.disableVideoProcessing && isVideoTrack(track)) {
				track.stopProcessor();
			}
			if (opts.reduceSubscriberVideoQuality) {
				room.remoteParticipants.forEach((participant) => {
					participant.videoTrackPublications.forEach((publication) => {
						publication.setVideoQuality(VideoQuality.LOW);
					});
				});
			}
		};

		room.localParticipant.on(ParticipantEvent.LocalTrackCpuConstrained, handleCpuConstrained);
		return () => {
			room.localParticipant.off(ParticipantEvent.LocalTrackCpuConstrained, handleCpuConstrained);
		};
	}, [room, opts.reducePublisherVideoQuality, opts.reduceSubscriberVideoQuality]);

	React.useEffect(() => {
		const lowerQuality = (_, publication) => {
			publication.setVideoQuality(VideoQuality.LOW);
		};
		if (lowPowerMode && opts.reduceSubscriberVideoQuality) {
			room.on(RoomEvent.TrackSubscribed, lowerQuality);
		}

		return () => {
			room.off(RoomEvent.TrackSubscribed, lowerQuality);
		};
	}, [lowPowerMode, room, opts.reduceSubscriberVideoQuality]);

	return lowPowerMode;
}
