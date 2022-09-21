import React, { useEffect } from "react";
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import inputFile from "../data/coordinates.txt";
const Plot = createPlotlyComponent(Plotly);

// create an interface called ICoordinateArray that contains an array of ICoordinate
interface ICoordinateArray extends Array<ICoordinate> {
	[index: number]: ICoordinate;
}

interface ICoordinate {
	colNum: number;
	rowNum: number;
	layerNum: number;
}

enum Coordinate {
	COL = "colNum",
	ROW = "rowNum",
	LAYER = "layerNum",
}

const Plotter = () => {
	const [loaded, setLoaded] = React.useState(false);
	const [coordinates, setCoordinates] = React.useState<ICoordinateArray>([]);

	useEffect(() => {
		// load input file, parse and store into coordinates
		fetch(inputFile)
			.then((r) => r.text())
			.then((text) => {
				let rawData: string[] = text.split("\n");
				// remove header row
				rawData = rawData.slice(1, rawData.length - 1);
				// create an array of ICoordinate objects
				let coordinateArray: ICoordinateArray = [];
				rawData.forEach((row, index) => {
					let rowArray = row.split(",");
					let coordinate: ICoordinate = {
						layerNum: parseInt(rowArray[0]),
						colNum: parseInt(rowArray[1]),
						rowNum: parseInt(rowArray[2]),
					};
					coordinateArray[index] = coordinate;
				});
				setCoordinates(coordinateArray);
				setLoaded(true);
			});
	}, []);

	const unpack = (rows: ICoordinateArray, key: Coordinate) => {
		let result: number[] = [];
		for (let row of rows) {
			result.push(row[key]);
		}
		return result;
	};

	const data: Plotly.Data[] = [
		{
			type: "scatter3d",
			x: unpack(coordinates, Coordinate.ROW),
			y: unpack(coordinates, Coordinate.COL),
			z: unpack(coordinates, Coordinate.LAYER),
			mode: "markers",
			marker: {
				symbol: "square",
				size: 10,
			},
		},
	];

	const layout: Partial<Plotly.Layout> = {
		scene: {
			aspectratio: {
				x: 1,
				y: 1,
				z: 2,
			},
			camera: {
				center: {
					x: 0,
					y: 0,
					z: 0,
				},
				eye: {
					x: 1.25,
					y: 1.25,
					z: 1.25,
				},
				up: {
					x: 0,
					y: 0,
					z: 1,
				},
			},
			xaxis: {
				type: "linear",
				zeroline: false,
			},
			yaxis: {
				type: "linear",
				zeroline: false,
			},
			zaxis: {
				type: "linear",
				zeroline: false,
			},
		},
		title: "Sheep Plotter",
		autosize: true,
		height: 800,
		width: 800,
	};

	return (
		<>
			{!loaded && <div>Loading</div>}

			{loaded && <Plot data={data} layout={layout} />}
		</>
	);
};

export default Plotter;
