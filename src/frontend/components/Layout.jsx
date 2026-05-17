import { Header } from "./Header";
import { Footer } from "./Footer";
import ScrollToTop from "./ScrollToTop";
import React from "react";
import { Outlet } from "react-router-dom";
import l from "../css/.module/layout.module.css";
export function Layout() {
  return (
    <div className={l.layout}>
      <ScrollToTop />
      <Header />
      <main className={l.content}>

        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
