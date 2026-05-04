import { formatChatMessageLinks, RoomContext, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs";
import { ExternalE2EEKeyProvider, LogLevel, Room, VideoPresets } from "livekit-client";
import { useEffect, useMemo, useState } from "react";
import { DebugMode } from "./Debug";
import "./globals.css";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { SettingsMenu } from "./SettingsMenu";
import { useLowCPUOptimizer } from "./usePerfomanceOptimiser";
import { useSetupE2EE } from "./useSetupE2EE";

const Video = ({
	token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSGFyc2hpdCIsInZpZGVvIjp7InJvb21Kb2luIjp0cnVlLCJyb29tIjoicm9vbS1BYjEyYzMiLCJjYW5QdWJsaXNoIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlfSwic3ViIjoiSGFyc2hpdCIsImlzcyI6IkFQSXVjRmQ3Q3hiMmlUMiIsIm5iZiI6MTc1MTk3ODA5MywiZXhwIjoxNzUxOTk5NjkzfQ.F-C8iqZ50l-gi19t9iPxgIsH09SXo1BWwHy1E5oSy5c",
	codec = undefined,
}) => {
	const keyProvider = new ExternalE2EEKeyProvider();
	const { worker, e2eePassphrase } = useSetupE2EE();
	const e2eeEnabled = !!(e2eePassphrase && worker);

	const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false);

	const roomOptions = useMemo(() => {
		return {
			publishDefaults: {
				videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
				red: !e2eeEnabled,
				videoCodec: codec,
			},
			adaptiveStream: { pixelDensity: "screen" },
			dynacast: true,
			e2ee: e2eeEnabled
				? {
						keyProvider,
						worker,
				  }
				: undefined,
		};
	}, [e2eeEnabled, codec, keyProvider, worker]);

	const room = useMemo(() => new Room(roomOptions), [roomOptions]);

	const connectOptions = useMemo(() => {
		return {
			autoSubscribe: true,
		};
	}, []);

	useEffect(() => {
		if (e2eeEnabled) {
			keyProvider.setKey(e2eePassphrase).then(() => {
				room.setE2EEEnabled(true).then(() => {
					setE2eeSetupComplete(true);
				});
			});
		} else {
			setE2eeSetupComplete(true);
		}
	}, [e2eeEnabled, e2eePassphrase, keyProvider, room, setE2eeSetupComplete]);

	useEffect(() => {
		if (e2eeSetupComplete) {
			room.connect(import.meta.env.VITE_LIVEKIT_URL, token, connectOptions).catch((error) => {
				console.error(error);
			});
			room.localParticipant.enableCameraAndMicrophone().catch((error) => {
				console.error(error);
			});
		}
	}, [room, token, connectOptions, e2eeSetupComplete]);

	useLowCPUOptimizer(room);

	return (
		<div style={{ width: "100%", height: "100%" }}>
			<RoomContext.Provider value={room}>
				<KeyboardShortcuts />
				<VideoConference
					chatMessageFormatter={formatChatMessageLinks}
					SettingsComponent={import.meta.env.VITE_SHOW_SETTINGS_MENU === "true" ? SettingsMenu : undefined}
				/>
				<DebugMode logLevel={LogLevel.debug} />
			</RoomContext.Provider>
		</div>
	);
};

export default Video;
