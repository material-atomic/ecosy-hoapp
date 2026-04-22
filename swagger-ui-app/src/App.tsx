import { Resizable, ResizableHandler, ResizablePane } from "./components/resizable";

import { ThemeProvider } from "./components/theme";
import { AppBar } from "./layout/appbar";
import { Sidebar } from "./layout/sidebar";
import { ViewPane } from "./layout/view-pane";
import { useUrls } from "@/hooks/schema";
import { IconApp } from "@/icons/app";

declare global {
  interface Window {
    API_JSON_URL: string[];
  }
}

function App() {
  const { selectedUrl } = useUrls();

  return (
    <ThemeProvider>
      <div className="app">
        <AppBar />
        {selectedUrl ? (
          <Resizable className="app-layout">
            {/* Cột trái (danh sách API endpoints) */}
            <ResizablePane defaultSize="30%" minSize={300} maxSize="50%">
              <Sidebar />
            </ResizablePane>
            {/* Thanh kéo ngang ở giữa */}
            <ResizableHandler />
            {/* Vùng chính (hiển thị chi tiết schema) */}
            <ResizablePane>
              <ViewPane />
            </ResizablePane>
          </Resizable>
        ) : (
          <div className="empty-app-state">
            <div className="empty-app-content">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Select BaseURL from <IconApp size={20} /> at the App bar to continue
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
