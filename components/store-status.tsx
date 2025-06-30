
interface StoreStatusProps {
  isOnline?: boolean;
}

export function StoreStatus({ isOnline = true }: StoreStatusProps) {
  return (
         <div
           className={`inline-flex items-center px-3 py-1 mt-4 rounded-full text-sm ${
             isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
           }`}
         >
           <span
             className={`w-2 h-2 rounded-full mr-2 ${
               isOnline ? "bg-green-500" : "bg-red-500"
             }`}
           ></span>
           {isOnline ? "We're accepting orders" : "Store is currently offline"}
         </div>
       );
}