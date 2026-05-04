import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";

const LiveKitModal = ({ token }) => {
	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="support-room">
					{token ? (
						<LiveKitRoom
							serverUrl={import.meta.env.VITE_LIVEKIT_URL}
							token={token}
							connect={true}
							video={false}
							audio={true}
							onDisconnected={() => {}}>
							<RoomAudioRenderer />
							<SimpleVoiceAssistant />
						</LiveKitRoom>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default LiveKitModal;
