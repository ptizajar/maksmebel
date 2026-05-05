import React, { useEffect} from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {Home} from "./pages/Home";
import {Catalog} from "./pages/Catalog";
import {Category} from "./pages/Category";
import {Favourites} from "./pages/Favourites";
import {NotFound} from "./pages/NotFound";
import Layout from "./components/Layout";
import Admin from "./pages/Admin";
import AdminCategory from "./pages/AdminCategory";
import Bids from "./pages/Bids";
import {ItemPage} from "./pages/ItemPage";
import { store } from "./store";
import { Provider, useDispatch } from "react-redux";
import { setUser } from "./store";
import { Account } from "./pages/Account";
import PriceHistory from "./pages/PriceHistory";
import "./reset.css"



const router = createBrowserRouter([
  {
    path: "/", //index:true указывает на этот путь
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // тоже самое что и path:""
      { path: "favourites", element: <Favourites /> },
      { path: "catalog", element: <Catalog /> },
      { path: "category/:category_id", element: <Category /> },
      { path: "item/:item_id", element: <ItemPage /> },
      { path: "admin", element:  <Admin /> },
      { path: "admin_category/:category_id", element: <AdminCategory /> },
      { path: "price_history/:item_id", element: <PriceHistory /> },
      { path: "bids", element: <Bids /> },
      { path: "account", element: <Account /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function AppImp({children}){
  const dispatch = useDispatch();
  async function refreshSession() {
    const result = await fetch('/api/refresh-session');
    const data = await result.json();
    dispatch(setUser(data.user))
    
    
  }
  useEffect(
    ()=>{
       refreshSession(); 
    },[]
  )
  return children // в данном случае router
}

function App() {
  //redux -> обновление сесии-> router

  return (
    <Provider store={store}>
      <AppImp>
        <RouterProvider router={router} />
      </AppImp>
    </Provider>
  )

}

export default App;
