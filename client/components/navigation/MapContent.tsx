const MapContent: React.FC<{
    loadError: boolean;
    isLoaded: boolean;
    children: React.ReactNode;
  }> = ({ loadError, isLoaded, children }) => {
    if (loadError) {
      return <div>地圖加載失敗</div>;
    }
  
    if (!isLoaded) {
      return <div>正在加載地圖...</div>;
    }
  
    return <>{children}</>;
  };

export default MapContent;