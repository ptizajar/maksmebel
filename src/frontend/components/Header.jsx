import React, { useState } from "react";
import { Link } from "react-router-dom";

import h from "../css/.module/header.module.css";
import { LoginForm } from "./LoginForm";
import { showDialog } from "./Dialog";
import { useSelector } from "react-redux";
import {  CircleUser, Settings, ShoppingBag, SquareMenu, Heart } from 'lucide-react';

export function Header() {
  const currentUser = useSelector((state) => state.user.currentUser);
 
  return (
    <>
      <nav className={h.header}>
        <ul className={h.menu}>
          <Link to={"/"} className={`${h.link} ${h.linkLogo}`}>
            <li className={`${h.item} ${h.itemLogo}`}>
               <div className={h.logoContent}>
              <img src="/public/m-logo2.svg" className={h.iconLogo}></img>
             <span>МАКС-МЕБЕЛЬ</span>
             </div>
            </li>
          </Link>
          <Link to={"/catalog"} className={h.link}>
            <li className={h.item}>
              <SquareMenu size={32} strokeWidth={2} color="#2A3E3C"/>
              <span>Каталог</span>
            </li>
          </Link>
          {!currentUser && <Link onClick={(e) => { e.preventDefault(); showDialog(LoginForm); }} className={h.link}>
            <li className={h.item}>
              <CircleUser size={32} strokeWidth={2} color="#2A3E3C"/>
             <span>Войти</span>
            </li>
          </Link>}

          {currentUser && !currentUser.is_admin && <Link to={"/account"} className={h.link}>
            <li className={h.item}>
               <CircleUser size={32} strokeWidth={2} color="#2A3E3C"/>
              <span>Аккаунт</span>
            </li>
          </Link>}
          {currentUser && !currentUser.is_admin && <Link to={"/favourites"} className={h.link}>
            <li className={h.item}>
               <Heart size={32} strokeWidth={2} color="#2A3E3C" />
              <span>Избранное</span>
            </li>
          </Link>}
          {currentUser?.is_admin && <Link to={"/admin"} className={h.link}>
            <li className={h.item}>
              <Settings size={32} strokeWidth={2} color="#2A3E3C" />
              <span>Управление</span>
            </li>
          </Link>}
          {currentUser?.is_admin && <Link to={"/bids"} className={h.link}>
            <li className={h.item}>
               <ShoppingBag size={32} strokeWidth={2} color="#2A3E3C" />
              <span>Заявки</span>
            </li>
          </Link>}
        </ul>
      </nav>
    </>

  );
}

