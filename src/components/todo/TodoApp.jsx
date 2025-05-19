import './todo.css'
import { TodoNew } from './TodoNew'
import { TodoData } from './TodoData'
import reactLogo from '../../assets/react.svg'
import { useState } from 'react'

const TodoApp = () => {
    const [todoList, setTodoList] = useState([
        // { id: 1, name: "Learning React" },
        // { id: 2, name: "Watching Youtube" }
    ]);

    const addNewTodo = (name) => {
        const newTodo = {
            id: randomIntFromInterval(1, 1000000),
            name
        }

        setTodoList([...todoList, newTodo])
    }

    const deleteTodo = (id) => {
        const newTodo = todoList.filter(item => item.id !== id)
        setTodoList(newTodo)
    }

    const randomIntFromInterval = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1));
    }

    return (
        <div className='todo-container'>
            <div className='todo-title'>Todo List</div>
            <TodoNew
                addNewTodo={addNewTodo}
            />
            {/* {todoList.length > 0 &&
            <TodoData
              todoList={todoList}
            />
          }
          {todoList.length === 0 &&
            <div className='todo-image'>
              <img src={reactLogo} className='logo' />
            </div>
          } */}
            {todoList.length > 0 ?
                <TodoData
                    todoList={todoList}
                    deleteTodo={deleteTodo}
                />
                :
                <div className='todo-image'>
                    <img src={reactLogo} className='logo' />
                </div>
            }

        </div>
    )
}

export default TodoApp;