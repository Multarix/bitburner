import { Colors } from "jsx/Colors";

const randomArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const addCustomStyle = () => {
	const styleTag = `button.custom-copyBtn {
		color: #ffffff;
		border: 1px solid #aaa;
		border-radius: 0px;
		font-weight: 1000;
		background-color: #333;
		padding: 1px 0.5em;
		width: 4em;
		
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
	let randID = "";
	for(let i = 0; i < 10; i++){
		const randChar = Math.floor(Math.random() * randomArray.length);
		randID += randomArray[randChar];
	}

	return <button id={randID} class={"custom-copyBtn"} onClick={() => {
		navigator.clipboard.writeText(props.toCopy);
		eval(`document.getElementById(randID).innerText = "✔️"
		setTimeout(() => {
			document.getElementById(randID).innerText = "Copy";
		}, 3000);`);
	}}>Copy</button>;
}

/** @param {NS} ns **/
export async function main(ns){
	eval(`if(!document.getElementById("customBtnCopy")) addCustomStyle();`);


	const factionName = <Colors color={"white"}>{ns.args[0]} (Req: {ns.args[2].toString().padStart(5, " ")})</Colors>;
	const factionLocation = <CopyButton toCopy={ns.args[1]}/>;

	ns.tprintRaw(<>{factionName} {factionLocation}</>);
}

// `${white(faction + ': "')}${yellow(path)}${white('"')}` : `${white(faction + ':')}
// const message = (path) ?  ${red("Couldn't find that server!")}`;

