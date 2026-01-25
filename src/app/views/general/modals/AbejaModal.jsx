import { ReactComponent as Bee1 } from '../images/bee1.svg';

const AbejaModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="abeja-sheet-overlay">
            <div className="abeja-sheet">
                <div className="abeja-svg-wrapper">
                    <Bee1 className="bee-intro" />
                </div>
                <button className="abeja-close-btn" onClick={onClose}>✕</button>
            </div>
        </div>
    );
};

export default AbejaModal;
