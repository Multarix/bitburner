export function Colors(props){
	const color = props.color || "inherit";
	const colorStyle = {
		color: color
	};

	return <span style={colorStyle}>{props.children}</span>;
}