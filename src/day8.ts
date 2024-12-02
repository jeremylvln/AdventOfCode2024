import { day } from './lib.js';
import { lcmOfArray } from './math.js';
import { Predicate } from './utils.js';

type Direction = 'L' | 'R';
type BuildingNode = {
  name: string;
  left?: BuildingNode;
  right?: BuildingNode;
};
type Node = {
  name: string;
  left: Node;
  right: Node;
};

const PARSE_NODE_REGEX = /^([A-Z]+)\s+=\s+\(([A-Z]+),\s([A-Z]+)\)$/;

const walkUntil = (
  start: Node,
  directions: readonly Direction[],
  objectivePredicate: Predicate<string>,
): number => {
  let steps = 0;
  let currentNode: Node = start;

  while (!objectivePredicate(currentNode.name)) {
    currentNode =
      directions[steps % directions.length] === 'L'
        ? currentNode.left
        : currentNode.right;
    steps += 1;
  }

  return steps;
};

const walkConcurrentlyUntil = (
  starts: readonly Node[],
  directions: readonly Direction[],
  objectivePredicate: Predicate<string>,
): number => {
  const stepsForEachNode: number[] = starts.map((node) =>
    walkUntil(node, directions, objectivePredicate),
  );
  return lcmOfArray(stepsForEachNode);
};

const parseNodes = (input: readonly string[]): [Node, readonly Node[]] => {
  const allNodes: Map<string, BuildingNode> = new Map();
  const deferredLinks: (() => void)[] = [];

  for (const line of input) {
    const match = PARSE_NODE_REGEX.exec(line);
    if (match === null) {
      continue;
    }

    const [, name, left, right] = match as unknown as [
      string,
      string,
      string,
      string,
    ];
    const node: BuildingNode = {
      name,
    };

    allNodes.set(name, node);
    deferredLinks.push(() => {
      node.left = allNodes.get(left)!;
      node.right = allNodes.get(right)!;
    });
  }

  for (const deferredLink of deferredLinks) {
    deferredLink();
  }

  return [allNodes.get('AAA')! as Node, [...allNodes.values()] as Node[]];
};

day(8, (input, part) => {
  const directions = [...input[0]!] as Direction[];
  const [root, allNodes] = parseNodes(input);
  const nodesEndingWithA = allNodes.filter((node) => node.name.endsWith('A'));

  part(1, () => walkUntil(root, directions, (name) => name === 'ZZZ'));
  part(2, () =>
    walkConcurrentlyUntil(nodesEndingWithA, directions, (name) =>
      name.endsWith('Z'),
    ),
  );
});
