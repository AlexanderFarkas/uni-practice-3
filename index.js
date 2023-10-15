import express from 'express';
import {create} from 'express-handlebars';

const app = express();
const hbs = create({
    helpers: {
        formatDate(isoDate) {
            return new Date(isoDate).toLocaleString(
                ['ru-RU'],
                {
                    dateStyle: 'long',
                    timeStyle: 'short',
                }
            );
        },
    }
});
app.use(express.static('public'));
app.use(express.json());

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');


let id = 0;
const todos = {};

app.get('/', (req, res) => {
    const todoArray = Array.from(Object.values(todos));
    // resolved sort last, then sort by created_at desc
    const sorted = todoArray.sort((a, b) => {
        if (a.resolved_at && b.resolved_at) {
            return new Date(b.resolved_at) - new Date(a.resolved_at);
        } else if (a.resolved_at) {
            return 1;
        } else if (b.resolved_at) {
            return -1;
        } else {
            return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    res.render('index', {todos: sorted});
});

app.post('/todo', (req, res) => {
    console.log(req);
    const {name} = req.body;
    const todoId = ++id;
    todos[todoId] = {
        id: todoId,
        name: name,
        created_at: new Date().toISOString(),
        resolved_at: null,
        priority: "medium",
    }
    res.status(201).json({id: id});
});

app.post('/todo/:id/resolve', (req, res) => {
    const {id} = req.params;
    todos[id].resolved_at = new Date().toISOString();
    res.status(200).json({id: id});
});

app.post('/todo/:id/priority', (req, res) => {
    const {id} = req.params;
    const {priority} = req.body;
    todos[id].priority = priority;
    res.status(200).json({id: id});
});

app.listen(3000, () => {
    console.log("Up and running")
});