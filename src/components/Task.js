import React from "react";
import { Draggable } from "react-beautiful-dnd";

function Task({ tasks, listId }) {
  return (
    <>
      {tasks.map((task, index) => {
        const draggableId = `${listId}-${index}-${task.title}`;
        
        // Debugging draggableId
        console.log("Generated Draggable ID:", draggableId);

        return (
          <Draggable key={draggableId} draggableId={draggableId} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  padding: "8px",
                  margin: "0 0 8px 0",
                  background: "lightgray",
                  ...provided.draggableProps.style,
                }}
              >
                <h5>{task.title}</h5>
                <p>{task.description}</p>
                <p>Due: {task.dueDate}</p>
                <p>Priority: {task.priority}</p>
              </div>
            )}
          </Draggable>
        );
      })}
    </>
  );
}

export default Task;
