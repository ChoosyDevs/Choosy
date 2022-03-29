const app = require('./app')
// Initialize the port that server is going to listen for incoming requests
const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
