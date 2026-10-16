// Code examples
export const binaryTreeCode = `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }

  // Parcours inordre (gauche → racine → droite)
  inorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }

  // Parcours préordre (racine → gauche → droite)
  preorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      result.push(node.value);
      this.preorderTraversal(node.left, result);
      this.preorderTraversal(node.right, result);
    }
    return result;
  }

  // Parcours postordre (gauche → droite → racine)
  postorderTraversal(node = this.root, result = []) {
    if (node !== null) {
      this.postorderTraversal(node.left, result);
      this.postorderTraversal(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  // Parcours par niveau
  levelOrderTraversal() {
    const result = [];
    if (!this.root) return result;

    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node.value);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    return result;
  }
}`;

export const bstCode = `class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Insérer une valeur
  insert(value) {
    const newNode = new TreeNode(value);

    if (this.root === null) {
      this.root = newNode;
      return this;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return undefined;

      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  // Rechercher une valeur
  find(value) {
    if (this.root === null) return false;

    let current = this.root;
    let found = false;

    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }

    if (!found) return false;
    return current;
  }
}`;

export const avlCode = `class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  // Obtenir la hauteur d'un nœud
  height(node) {
    if (node === null) return 0;
    return node.height;
  }

  // Obtenir le facteur d'équilibre
  getBalanceFactor(node) {
    if (node === null) return 0;
    return this.height(node.left) - this.height(node.right);
  }

  // Rotation droite
  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;

    // Effectuer la rotation
    x.right = y;
    y.left = T2;

    // Mettre à jour les hauteurs
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

    // Retourner la nouvelle racine
    return x;
  }

  // Rotation gauche
  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;

    // Effectuer la rotation
    y.left = x;
    x.right = T2;

    // Mettre à jour les hauteurs
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

    // Retourner la nouvelle racine
    return y;
  }

  // Insérer un nœud
  insert(value) {
    this.root = this._insert(this.root, value);
    return this;
  }

  _insert(node, value) {
    // Insertion BST standard
    if (node === null) return new AVLNode(value);

    if (value < node.value)
      node.left = this._insert(node.left, value);
    else if (value > node.value)
      node.right = this._insert(node.right, value);
    else
      return node; // Les doublons ne sont pas autorisés

    // Mettre à jour la hauteur
    node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;

    // Obtenir le facteur d'équilibre
    const balance = this.getBalanceFactor(node);

    // Cas de déséquilibre

    // Gauche Gauche
    if (balance > 1 && value < node.left.value)
      return this.rightRotate(node);

    // Droite Droite
    if (balance < -1 && value > node.right.value)
      return this.leftRotate(node);

    // Gauche Droite
    if (balance > 1 && value > node.left.value) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // Droite Gauche
    if (balance < -1 && value < node.right.value) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }
}`;

export const graphCode = `class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  // Ajouter un sommet
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  // Ajouter une arête (non orientée)
  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
    this.adjacencyList[vertex2].push(vertex1);
  }

  // Supprimer une arête
  removeEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
      v => v !== vertex2
    );
    this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
      v => v !== vertex1
    );
  }

  // Supprimer un sommet
  removeVertex(vertex) {
    while (this.adjacencyList[vertex].length) {
      const adjacentVertex = this.adjacencyList[vertex].pop();
      this.removeEdge(vertex, adjacentVertex);
    }
    delete this.adjacencyList[vertex];
  }

  // Parcours en profondeur (DFS) récursif
  depthFirstRecursive(start) {
    const result = [];
    const visited = {};
    const adjacencyList = this.adjacencyList;

    (function dfs(vertex) {
      if (!vertex) return null;
      visited[vertex] = true;
      result.push(vertex);

      adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          return dfs(neighbor);
        }
      });
    })(start);

    return result;
  }

  // Parcours en largeur (BFS)
  breadthFirst(start) {
    const queue = [start];
    const result = [];
    const visited = {};
    visited[start] = true;

    while (queue.length) {
      const currentVertex = queue.shift();
      result.push(currentVertex);

      this.adjacencyList[currentVertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      });
    }

    return result;
  }
}`;
