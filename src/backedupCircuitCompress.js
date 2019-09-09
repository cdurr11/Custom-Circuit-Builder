compress(){
  let newMap = {};
  let bypasses = [];
  let tempVisited = [];
  let connections = this.connections;

  function compress_helper(start, current, final_arr) {
    if (start === 4) {
    }
    if (current !== start) {
      if (connections[start].length > 2) {
        if (!final_arr.includes(start)) {
            final_arr.push(start);
        }
        return;
      }
      else if (connections[start].length === 2) {
        bypasses.push(start);
      }

      else if ((connections[start].length === 1) && (current !== start)){
          if (!final_arr.includes(start)) {
              final_arr.push(start);
          }
        return;
      }
    }

    for (let i = 0; i < connections[start].length; i++) {
      if (start === 4){
        console.log(i);
      }
      if (!(tempVisited.includes(connections[start][i]))) {
          if (connections[connections[start][i]].length <= 2) {
              tempVisited.push(connections[start][i]);
          }
          compress_helper(connections[start][i], current, final_arr);
      }
    }
      return final_arr;
    }

  //hardcoded 28
  for (let i = 1; i < 29; i++) {
    if (!bypasses.includes(i)) {
      if (i in connections) {
        if (i === 4) {
        }
        bypasses.push(i);
        tempVisited = [];
        let arr1 = compress_helper(i, i, []);
        newMap[i] = arr1;
      }
    }
  }
  return newMap;
}
