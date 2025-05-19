const TodoData = (props) => {
    //console.log(">> Check props: ", props)
    const { todoList, deleteTodo } = props;

    const handleClick = (id) => {
        deleteTodo(id)
    }

    return (
        <div className='todo-data'>
            {todoList.map((item, index) => {
                console.log("Check item: ", item);
                console.log("Check index: ", index);
                return (
                    <div className={`todo-item`} key={item.id}>
                        <div>{item.name}</div>

                        <button
                            onClick={() => handleClick(item.id)}
                            style={{ cursor: "pointer" }}>Delete</button>

                    </div>
                )
            })}
            <div>
                {/* {JSON.stringify(todoList)} */}
            </div>
        </div>
    )
}

export { TodoData }