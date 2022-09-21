import React, { useEffect, useState } from "react";
import Plotly from "plotly.js/";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);
const coordinates = require("../data/coordinates.txt");

interface ICoordinateArray extends Array<ICoordinate> {
	[index: number]: ICoordinate;
}

interface ICoordinate {
	readonly rowNum: number; // x
	readonly colNum: number; // y
	readonly layerNum: number; // z
}

enum Coordinate {
	ROW = "rowNum",
	COL = "colNum",
	LAYER = "layerNum",
}

const Plotter = () => {
	const [loaded, setLoaded] = useState(false);
	const [rows, setRows] = useState<ICoordinateArray>();

	const generateColorByLayer = () => {
		if (rows === undefined) {
			return;
		}
		const NUM_OF_LAYERS = rows[0].layerNum;
		const uniqueColors: string[] = [];
		while (uniqueColors.length < NUM_OF_LAYERS) {
			const randomColor = `rgb(${Math.floor(
				Math.random() * 255
			)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
				Math.random() * 255
			)})`;
			if (!uniqueColors.includes(randomColor)) {
				uniqueColors.push(randomColor);
			}
		}

		let arr = [];
		for (let i = 0; i < rows.length; i++) {
			arr.push(uniqueColors[rows[i].layerNum]);
		}
		return arr;
	};

	useEffect(() => {
		// Import coordinates from text file and save to rows
		fetch(coordinates)
			.then((response) => response.text())
			.then((data) => {
				let dataArr = data.split("\n").slice(1, -1);
				let numArr: ICoordinateArray = [];
				for (let i = 0; i < data.length; i++) {
					let unparsedData = dataArr[i].split(" ");
					let coordinate = {
						rowNum: parseInt(unparsedData[0]),
						colNum: parseInt(unparsedData[1]),
						layerNum: parseInt(unparsedData[2]),
					};
					numArr[i] = coordinate;
				}
				setRows(numArr);
				setLoaded(true);
			});
	}, []);

	const unpack = (rows: ICoordinateArray | undefined, key: Coordinate) => {
		if (rows === undefined) {
			return;
		}
		let arr: number[] = [];
		for (let i = 0; i < rows.length; i++) {
			arr.push(rows[i][key]);
		}
		return arr;
	};

	const layout = {
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
			// xaxis: {
			// 	type: "linear",
			// 	zeroline: false,
			// },
			// yaxis: {
			// 	type: "linear",
			// 	zeroline: false,
			// },
			// zaxis: {
			// 	type: "linear",
			// 	zeroline: false,
			// },
		},
		title: "sheep a sheep",
		height: 800,
		width: 800,
	};

	return (
		<>
			{!loaded && <div>Loading...</div>}
			{loaded && (
				<Plot
					data={[
						{
							x: unpack(rows, Coordinate.ROW), //
							y: unpack(rows, Coordinate.COL), //
							z: unpack(rows, Coordinate.LAYER), //
							mode: "markers",
							type: "scatter3d",
							marker: {
								size: 12,
								color: generateColorByLayer(),
								symbol: "square",
							},
						},
						// {
						// 	alphahull: 7,
						// 	opacity: 0.1,
						// 	type: "mesh3d",
						// 	x: unpack(rows, 0),
						// 	y: unpack(rows, 1),
						// 	z: unpack(rows, 2),
						// },
					]}
					layout={layout}
				/>
			)}
		</>
	);
};

export default Plotter;
