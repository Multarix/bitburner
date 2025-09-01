import { timeConvert } from "/helpers/Functions.js";

/**  */
const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;

// Usage: ns.printRaw(<Timer countdown={ms} />);
export function Timer(args){
	const endTime = useRef(args.startTime + args.countdown);
	const [value, setValue] = useState(args.countdown);
	const timeoutID = useRef(null);

	useEffect(() => {
		timeoutID.current = setTimeout(() => {
			if(value <= 0){
				// clear interval
				clearTimeout(timeoutID.current);
				timeoutID.current = null;
				return;
			}

			const counter = Math.round((endTime.current - Date.now()) / 1000) * 1000;
			setValue(counter);
			// console.log(value);
		}, 1000);


		return () => clearTimeout(timeoutID.current);
	}, [value]);

	return (value <= 0) ? "0s" : `${timeConvert(value)}`;
}