export function getRolesByParentChain(
  groupTree: Array<GroupTree>,
  parentChain: string,
) {
  const parentNodes = parentChain?.split('/');
  let roles: string[] = [];
  groupTree
    .filter((el) => parentNodes.includes(el.name ?? ''))
    .map((el) => el.defaultRoles)
    .forEach((el) => {
      roles = [...roles, ...(el ?? [])];
    });

  return [...new Set(roles)];
}

export function getFlatGroupTree(groupTree: GroupTree[]) {
  let groupQue = groupTree;
  groupQue.forEach((el) => {
    if (el.children) {
      groupQue = [...groupQue, ...el.children];
    }
  });
  return groupQue;
}

interface GroupTree {
  children?: Array<any>;
  defaultRoles?: Array<string>;
  name?: string;
}
