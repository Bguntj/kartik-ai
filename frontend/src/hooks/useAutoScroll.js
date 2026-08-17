import { useEffect, useRef } from "react";


export default function useAutoScroll(dependencies){


  const bottomRef = useRef();


  useEffect(()=>{


    bottomRef.current?.scrollIntoView({

      behavior:"smooth"

    });


  },dependencies);



  return bottomRef;

}