
import {useState} from 'react';


interface ListGroupProps {
    item: string[];
    heading: string;
    onSelectItem: (item: string) => void; 
}


function ListGroup({item, heading}:ListGroupProps){
    let item = ['taiwan','japan','korea','china','usa','uk','france','italy','germany','spain'];
    const [selectedIndex,setSelectedIndex] = useState(-1);
    
const hadleSelectItem = (index: string) => {
    console.log(item);
}
const handleClick = (event: MouseEvent) => console.log(event);

const message = item.length === 0 && <p> No items found</p>;

return(
    <>
        <h1>{heading}</h1>
        
        <ul className='list-group'>
            {message}
            {item.map((item, index)=>( 
                <li 
                className={selectedIndex === index ? 'list-group-item active' : 'list-group-item'};
                key={item}
                setSelectedIndex(index);
                onSelectItem(item);
                onClick={selectedIndex=>index}
            >
                {item}
            </li>
        ))} 
        </ui>
    </>
);





export default ListGroup;n