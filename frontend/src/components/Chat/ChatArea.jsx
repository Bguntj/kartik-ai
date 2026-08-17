import Message from "./Message";
import TypingIndicator from "../Common/TypingIndicator";
import useDragDrop from "../../hooks/useDragDrop";
import useAutoScroll from "../../hooks/useAutoScroll";


export default function ChatArea({

  messages = [],

  loading,

  regenerate

}) {


  const {

    dragging,

    handleDragOver,

    handleDragLeave,

    handleDrop,

  } = useDragDrop();



  const bottomRef = useAutoScroll([messages]);



  return (

    <div

      className={`chat-area ${
        dragging ? "dragging" : ""
      }`}

      onDragOver={handleDragOver}

      onDragLeave={handleDragLeave}

      onDrop={handleDrop}

    >



      {dragging && (

        <div className="drop-overlay">

          <h2>
            📂 Drop your file here
          </h2>

        </div>

      )}



      {messages.length === 0 ? (


        <div className="welcome">

          <h1>
            Kartik AI
          </h1>

          <p>
            Your Personal AI Assistant
          </p>

        </div>


      ) : (


        messages.map((msg,index)=>(


          <Message

            key={index}

            sender={msg.sender}

            text={msg.text}

            onRegenerate={regenerate}

            onEdit={()=>{
              console.log("Edit message");
            }}

          />


        ))


      )}



      {loading && (

        <TypingIndicator />

      )}



      <div ref={bottomRef}></div>



    </div>

  );

}