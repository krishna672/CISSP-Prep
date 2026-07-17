import { MindMapNode, MindMapOverrides } from '../types';

// Applies admin edits and admin-added nodes on top of the base static mind
// map tree, without mutating the base tree. Edited fields are shallow-merged
// onto matching nodes by id; added nodes are appended as children of their
// parentId (which can itself be another added node, allowing multi-level
// custom branches).
export function applyMindMapOverrides(base: MindMapNode, overrides: MindMapOverrides): MindMapNode {
  const edits = overrides?.edits || {};
  const added = overrides?.added || [];

  const childrenByParent: Record<string, MindMapNode[]> = {};
  added.forEach(a => {
    const newNode: MindMapNode = {
      id: a.id,
      label: a.label,
      type: a.type,
      color: a.color,
      definition: a.definition,
      example: a.example,
      enforcement: a.enforcement,
      keyAspect: a.keyAspect,
      notes: a.notes,
      citation: a.citation,
    };
    if (!childrenByParent[a.parentId]) childrenByParent[a.parentId] = [];
    childrenByParent[a.parentId].push(newNode);
  });

  const walk = (node: MindMapNode): MindMapNode => {
    const edit = edits[node.id];
    const mergedChildren = (node.children || []).map(walk);
    const extraChildren = (childrenByParent[node.id] || []).map(walk);
    const allChildren = [...mergedChildren, ...extraChildren];

    return {
      ...node,
      ...(edit || {}),
      children: allChildren.length > 0 ? allChildren : node.children,
    };
  };

  return walk(base);
}
