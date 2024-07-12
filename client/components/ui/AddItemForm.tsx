import React, { useState } from 'react';

type AddItemFormProps = {
  addItem: (name: string, price: number) => void;
  onClose: () => void;
};

/**
 * Represents a form for adding an item.
 * @param {Object} props - The component props.
 * @param {Function} props.addItem - The function to add an item.
 * @param {Function} props.onClose - The function to close the form.
 * @returns {JSX.Element} The JSX element representing the add item form.
 */
const AddItemForm: React.FC<AddItemFormProps> = ({ addItem, onClose }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = () => {
        addItem(name, parseFloat(price));
        onClose();
    };

    return (
        <div className="add-item-form">
            <span className="close-btn" onClick={onClose}>&times;</span>
            <h3>新增商品</h3>
            <input
                type="text"
                placeholder="品牌+名稱+份量 (小 中 大)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="價格"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={handleSubmit}>加入購物車</button>
        </div>
    );
};

export default AddItemForm;
