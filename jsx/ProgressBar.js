import { progressBar } from "helpers/Functions";

function ProgressBar(props){
	let barColor = "red";
	if(props.progress > 0.25) barColor = "orange";
	if(props.progress > 0.5) barColor = "yellow";
	if(props.progress > 0.75) barColor = "green";

	const full = props.full || "#";
	const empty = props.empty || "-";

	return <Colors color="white">[<Colors color={barColor}>{progressBar(props.progress, full, empty)}</Colors>]</Colors>;
}
