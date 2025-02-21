import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "../components/ui/alert-dialog";
  import { Trash2 } from "lucide-react";
  
  interface DeleteConfirmationModalProps {
    onDelete: () => void;
    isLoading: boolean;
    itemType: string; // Nuevo prop para el tipo de elemento
  }
  
  const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    onDelete, 
    isLoading, 
    itemType 
  }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente este {itemType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  export default DeleteConfirmationModal;