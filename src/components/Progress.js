import ProgressBar from 'react-bootstrap/ProgressBar';

const Progress = ({votes, quorum}) => {
    return(
        <div className="my-3">
            <ProgressBar now={(votes / quorum) * 100} label = {`${(votes / quorum) * 100} %`} />
        </div>
    )
}

export default Progress;