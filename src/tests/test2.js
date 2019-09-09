let types = {};
types[[0,1]] = "W";
types[[1,0]] = "W";
types[[1,2]] = "W";
types[[2,1]] = "W";
types[[2,3]] = "W";
types[[3,2]] = "W";
types[[3,4]] = "R";
types[[4,3]] = "R";
types[[3,5]] = "W";
types[[5,3]] = "W";
types[[5,6]] = "R";
types[[6,5]] = "R";

let connects = {0:[1], 1:[2], 2:[3], 3:[4,5], 5:[6]};
