import { SimulatorExamples, SimulatorType } from '../types/RequestTypes';

type SimulationMap = Record<SimulatorType, SimulatorExamples>;

const EXAMPLES: SimulationMap = require(`./exampleMap.json`);

export default EXAMPLES;
