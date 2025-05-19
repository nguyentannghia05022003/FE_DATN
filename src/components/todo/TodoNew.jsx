import { useState } from "react";

const TodoNew = (props) => {
    const { addNewTodo } = props;
    const [valueInput, setValueInput] = useState();

    // addNewTodo("eric")
    const handleClick = () => {
        addNewTodo(valueInput);
        setValueInput("");
    }

    const handleOnChange = (name) => {
        setValueInput(name)
    }
    return (
        <div className='todo-new'>
            <input type="text"
                onChange={(event) => { handleOnChange(event.target.value) }}
                value={valueInput}
            />
            <button
                className='todo-button'
                onClick={handleClick}
            > Add
            </button>
            {/* <div>Text input = {valueInput}</div> */}
        </div>
    )
}

export { TodoNew }