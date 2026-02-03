import '../App.css'
import CreatePost from '../components/CreatePost.jsx'
import PostView from '../components/PostView.jsx'


const DashBoard = () => {
  return (
    <div className="parent-container">
      <div className="create-post">
        <CreatePost />
      </div>

      <div className="post-view">
        <PostView />
      </div>
    </div>
  );
};

export default DashBoard;


