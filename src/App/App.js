import './App.css';
import Auth from "../Component/Auth/auth"
import Admin from "../Component/Admin/admin"
import { Route, Redirect } from "react-router-dom"
import  { connect } from "react-redux"
import Suggestion from '../Component/Suggestion/suggestion';
import MyFriend from "../Component/MyFriend/myFriend"
import Notificaton from '../Component/Notification/notification';
import Logout from '../Component/Logout/logout';
function App(props) {
  return (
    <div className="App">
    {props.token ? <Redirect to = "/admin"  /> : null}
      <Route exact path =  "/" component = {Auth}/>
      <Route exact path =  "/admin" component = {Admin}/>
      <Route exact path =  "/suggestion" component = {Suggestion}/>
      <Route exact path =  "/myfriend" component = {MyFriend}/>
      <Route exact path = "/notification" component = {Notificaton}/>
      <Route exact path = "/logout" component = {Logout}/>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
      token  : state.token
  }
}

export default  connect(mapStateToProps)(App) ;
