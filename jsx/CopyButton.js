import { Colors } from "jsx/Colors";

const randomArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const addCustomStyle = () => {
	const styleTag = `button.custom-copyBtn {
		color: #ffffff;
		border: 1px solid #aaa;
		border-radius: 0px;
		font-weight: 1000;
		background-color: #333;
		padding: 0.8em 0.5em;
		
		&:hover {
			background-color: #555;
		}
		
		&:active {
			background-color: #444;
		}
	}`;

	eval(`const btnStyle = document.createElement("style");
	btnStyle.innerHTML = styleTag;
	btnStyle.id = "customBtnCopy";
	document.head.appendChild(btnStyle);`);
};


const copyBtnStyle = {
	color: "#ffffff",
	border: "1px solid white",
	borderRadius: "0px",
	fontWeight: "1000",
	backgroundColor: "#222",
	padding: "1px 0.5em"
};


function CopyButton(props){
	const command = props.command;
	const buttonText = props.text || "Copy";

	let randID = "";
	for(let i = 0; i < 10; i++){
		const randChar = Math.floor(Math.random() * randomArray.length);
		randID += randomArray[randChar];
	}

	return <button id={randID} class={"custom-copyBtn"} onClick={() => {
		eval(`
			const terminalInput = document.getElementById("terminal-input");
			terminalInput.value = command;
			const handler = Object.keys(terminalInput)[1];
			terminalInput[handler].onChange({ target: terminalInput });
			terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });

			document.getElementById(randID).innerText = "✔️"
			setTimeout(() => {
				document.getElementById(randID).innerText = "Copy";
			}, 3000);
		`);
	}}>{buttonText}</button>;
}

/** @param {NS} ns **/
export async function main(ns){
	eval(`if(!document.getElementById("customBtnCopy")) addCustomStyle();`);
	const name = ns.args[0];
	const commandToRun = ns.args[1];
	const hackingLevel = ns.args[2];
	const buttonText = ns.args[3];


	const factionName = <Colors color={"white"}>{name} (Req: {hackingLevel.toString().padStart(5, " ")})</Colors>;
	const factionLocation = <CopyButton command={commandToRun} text={buttonText}/>;

	ns.tprintRaw(<>{factionName} {factionLocation}</>);
}

// `${white(faction + ': "')}${yellow(path)}${white('"')}` : `${white(faction + ':')}
// const message = (path) ?  ${red("Couldn't find that server!")}`;

