import calculateComplexity from "./calculateComplexity";
import isHotspotFile from "./isHotspotFile";
import { FileNode, GitHubTreeItem } from "./types";

const buildFileTree = (items: GitHubTreeItem[]): FileNode[] => {
  const root: Map<string, FileNode> = new Map();
  
  const sortedItems = [...items].sort((a, b) => {
    const depthA = a.path.split('/').length;
    const depthB = b.path.split('/').length;
    return depthA - depthB;
  });

  sortedItems.forEach((item) => {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    
    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "folder" : "file",
      children: item.type === "tree" ? [] : undefined,
      size: item.size,
      hotspot: item.type === "blob" ? isHotspotFile(item.path, name) : undefined,
      complexity: item.type === "blob" ? calculateComplexity(name, item.size) : undefined,
    };

    if (parts.length === 1) {
      root.set(item.path, node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = root.get(parentPath);
      
      if (parent && parent.children) {
        parent.children.push(node);
      }
      
      if (item.type === "tree") {
        root.set(item.path, node);
      }
    }
  });

  return Array.from(root.values()).filter(node => {
    const depth = node.path.split('/').length;
    return depth === 1;
  });
};

export default buildFileTree;