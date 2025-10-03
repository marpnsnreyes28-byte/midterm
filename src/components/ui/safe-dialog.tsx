import { forwardRef, type ReactNode, type ComponentProps, type MouseEvent, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { Dialog, DialogContent } from './dialog';

type SafeDialogProps = ComponentProps<typeof Dialog> & {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type SafeDialogContentProps = ComponentProps<typeof DialogContent>;

const createDialogHandlers = (setIsOpen: (open: boolean) => void) => ({
  onInteractOutside: (e: MouseEvent) => e.preventDefault(),
  onPointerDownOutside: (e: PointerEvent) => e.preventDefault(),
  onEscapeKeyDown: (e: KeyboardEvent) => e.preventDefault(),
  onOpenAutoFocus: (e: FocusEvent) => e.preventDefault(),
  onOpenChange: (open: boolean) => setIsOpen(open)
});

export const SafeDialog = forwardRef<HTMLDivElement, SafeDialogProps>(
  ({ children, isOpen, setIsOpen, ...props }, ref) => (
    <Dialog 
      open={isOpen} 
      modal 
      onOpenChange={(open: boolean) => setIsOpen(open)}
      {...props}
    >
      {children}
    </Dialog>
  )
);
SafeDialog.displayName = 'SafeDialog';

export const SafeDialogContent = forwardRef<HTMLDivElement, SafeDialogContentProps>(
  ({ children, ...props }, ref) => (
    <DialogContent 
      ref={ref}
      {...createDialogHandlers(props.onOpenChange as (open: boolean) => void)}
      {...props}
    >
      {children}
    </DialogContent>
  )
);
SafeDialogContent.displayName = 'SafeDialogContent';