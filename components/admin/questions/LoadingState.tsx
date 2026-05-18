// components/admin/questions/LoadingState.tsx

const LoadingState = () => {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  };
  
export default LoadingState;