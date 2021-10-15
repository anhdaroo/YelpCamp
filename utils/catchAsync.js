module.exports = func => {
    //We pass func in 
    //we return a function that accepts a function and then executes that function and catches 
    //any errors and sends it to next
    //Lecture 441, start at 3:05
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}