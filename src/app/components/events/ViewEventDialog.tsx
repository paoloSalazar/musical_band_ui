import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../../lib/api';
import type { Event, EventMusician } from '../../lib/types';
import type { ApiError } from '../../lib/api/client';
import { ViewMusicianPaymentsDialog } from './ViewMusicianPaymentsDialog';
import { formatDateHumanReadable, formatTimeHumanReadable } from '../../lib/timezone';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2, Pencil, Calendar, MapPin, Clock, User, DollarSign, Save, CreditCard, Wallet, Users, PieChart } from 'lucide-react';
import { ViewPaymentDetailsDialog } from './ViewPaymentDetailsDialog';
import { MakePaymentDialog } from './MakePaymentDialog';

interface ViewEventDialogProps {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (eventId: number) => void;
  canEditEvent?: boolean;
  onPriceUpdate?: (event: Event) => void;
  showEditButton?: boolean;
  onManageMusicians?: (eventId: number) => void;
}

export function ViewEventDialog({ eventId, open, onOpenChange, onEdit, canEditEvent, onPriceUpdate, showEditButton = true, onManageMusicians }: ViewEventDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasRole, user, hasPermission } = useUser();
  const isAdmin = hasRole('admin');
  const canManageMusicians = hasPermission('read:event_musician');
  const isMusicianUser = hasRole('musician') || hasRole('auxiliar_musician') || hasRole('helper');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);

  // Payment dialogs state
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showMakePayment, setShowMakePayment] = useState(false);

  // Personal musician payment summary (for musician/auxiliar/helper roles)
  const [myMusicianAssignment, setMyMusicianAssignment] = useState<EventMusician | null>(null);
  const [showMyMusicianPayments, setShowMyMusicianPayments] = useState(false);

  // Reports state
  const [billingSummaryLoading, setBillingSummaryLoading] = useState(false);
  const [billingSummaryData, setBillingSummaryData] = useState<any>(null);
  const [billingSummaryError, setBillingSummaryError] = useState<string | null>(null);
  const [showBillingSummaryPopup, setShowBillingSummaryPopup] = useState(false);

  const [musicianSummaryLoading, setMusicianSummaryLoading] = useState(false);
  const [musicianSummaryData, setMusicianSummaryData] = useState<any[]>([]);
  const [musicianSummaryError, setMusicianSummaryError] = useState<string | null>(null);
  const [showMusicianSummaryPopup, setShowMusicianSummaryPopup] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
    } else if (!open) {
      setMyMusicianAssignment(null);
      setShowMyMusicianPayments(false);
    }
  }, [open, eventId]);

  // Load personal musician assignment for non-admin musician roles (to allow viewing own payment summary)
  useEffect(() => {
    if (event && user && isMusicianUser && !isAdmin) {
      loadMyMusicianAssignment();
    } else {
      setMyMusicianAssignment(null);
    }
  }, [event, user, isMusicianUser, isAdmin]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventsApi.getById(eventId);
      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyMusicianAssignment = async () => {
    if (!user || !eventId) {
      setMyMusicianAssignment(null);
      return;
    }
    try {
      const response = await eventsApi.getEventMusicians(eventId);
      const assignment = response.data.find((m: EventMusician) => m.musician_id === user.id) || null;
      setMyMusicianAssignment(assignment);
    } catch (err) {
      // Non-fatal; button simply won't appear
      setMyMusicianAssignment(null);
    }
  };

  const formatDate = (dateString: string) => {
    // return formatDateUtil(dateString);
  };

  const formatTimeOnly = (dateString: string) => {
    return formatTimeHumanReadable(dateString, i18n.language);
  };

  const handleEdit = () => {
    if (onEdit && eventId) {
      onEdit(eventId);
      onOpenChange(false);
    }
  };

  const handleManageMusicians = () => {
    if (eventId) {
      navigate(`/events/${eventId}/musicians`);
      onOpenChange(false);
    }
  };

  const handleStartEditPrice = () => {
    if (event) {
      setPriceInput(event.price !== undefined && event.price !== null ? event.price.toString() : '');
    }
  };

  const handleCancelEditPrice = () => {
    setPriceInput('');
    setPriceError(null);
  };

  const handleSavePrice = async () => {
    if (!event) return;
    
    const priceValue = priceInput.trim() === '' ? null : parseFloat(priceInput);
    
    if (priceValue !== null && isNaN(priceValue)) {
      setPriceError(t('events.dialog.view.validation.invalidAmount'));
      return;
    }
    
    if (priceValue !== null && priceValue < 0) {
      setPriceError(t('events.dialog.view.validation.priceNegative'));
      return;
    }

    try {
      setIsUpdatingPrice(true);
      setPriceError(null);
      
      const response = await eventsApi.updatePrice(event.id, priceValue || 0);
      setEvent(response.data);
      
      if (onPriceUpdate) {
        onPriceUpdate(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setPriceError(apiError.detail || apiError.message || t('events.dialog.view.failedToUpdate'));
     } finally {
       setIsUpdatingPrice(false);
     }
   };

const handleFetchBillingSummary = async () => {
      if (!event) return;
      
      setBillingSummaryLoading(true);
      setBillingSummaryError(null);
      try {
        const response = await eventsApi.getEventBillingSummary(event.id);
        setBillingSummaryData(response.data);
        setShowBillingSummaryPopup(true);
      } catch (err) {
        const apiError = err as ApiError;
        setBillingSummaryError(apiError.detail || apiError.message || t('events.dialog.view.failedToLoadBillingSummary'));
      } finally {
        setBillingSummaryLoading(false);
      }
    };

const handleFetchMusicianPaymentSummary = async () => {
      if (!event) return;
      
      setMusicianSummaryLoading(true);
      setMusicianSummaryError(null);
      try {
        const response = await eventsApi.getEventMusicianPaymentSummary(event.id);
        setMusicianSummaryData(response.data);
        setShowMusicianSummaryPopup(true);
      } catch (err) {
        const apiError = err as ApiError;
        setMusicianSummaryError(apiError.detail || apiError.message || t('events.dialog.view.failedToLoadMusicianPaymentSummary'));
      } finally {
        setMusicianSummaryLoading(false);
      }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('events.dialog.view.title')}</DialogTitle>
          <DialogDescription>
            {t('events.dialog.view.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('events.dialog.view.loading')}</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">
            <p className="font-medium">{t('events.dialog.view.error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : event ? (
          <div className="space-y-4">
            {/* Event Name */}
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{event.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {t(`events.status.${event.status}`)}
              </span>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{t('events.dialog.view.description')}</p>
                <p className="text-sm">{event.description}</p>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.date')}</p>
                <p className="text-sm">
                  {formatDateHumanReadable(event.start_datetime, i18n.language)}
                  {event.start_datetime !== event.end_datetime && (
                    <> - {formatDateHumanReadable(event.end_datetime, i18n.language)}</>
                  )}
                </p>
              </div>
            </div>

            {/* Time */}
            {!event.is_all_day && (
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t('events.dialog.view.time')}</p>
                  <p className="text-sm">
                    {formatTimeHumanReadable(event.start_datetime, i18n.language)} - {formatTimeHumanReadable(event.end_datetime, i18n.language)}
                  </p>
                </div>
              </div>
            )}

            {/* All Day */}
            {event.is_all_day && (
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 text-gray-500" />
                <p className="text-sm">{t('events.dialog.view.allDay')}</p>
              </div>
            )}

            {/* Place */}
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">{t('events.dialog.view.location')}</p>
                <p className="text-sm">{event.place}</p>
              </div>
            </div>

            {/* Price - visible to admins and event creators */}
            {event && user && (isAdmin || event.user_id === user.id) && (
              <div className="flex items-start space-x-2">
                <DollarSign className="h-4 w-4 mt-1 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t('events.dialog.view.price')}</p>
                  {isAdmin ? (
                  priceInput !== '' || event.price !== undefined ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={event.price !== undefined ? event.price : priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder={t('events.dialog.view.enterPrice')}
                        className="h-8 w-32"
                        disabled={isUpdatingPrice}
                      />
                      {priceInput !== '' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSavePrice}
                            disabled={isUpdatingPrice}
                            className="h-8"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditPrice}
                            disabled={isUpdatingPrice}
                            className="h-8"
                          >
                            {t('common.cancel')}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartEditPrice}
                          className="h-8"
                        >
                          {t('events.dialog.view.setPrice')}
                        </Button>
                      )}
                    </div>
                  ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartEditPrice}
                          className="h-8 mt-1"
                        >
                          {t('events.dialog.view.setPrice')}
                        </Button>
                  )
                ) : (
                  <p className="text-sm">
                    {event.price !== undefined && event.price !== null
                      ? `${event.price.toFixed(2)}`
                      : t('events.dialog.view.noPrice')}
                  </p>
                )}
                {priceError && (
                  <p className="text-xs text-red-600 mt-1">{priceError}</p>
                )}
                </div>
              </div>
            )}

             {/* Created By */}
             {event.created_by && (
               <div className="flex items-start space-x-2">
                 <User className="h-4 w-4 mt-1 text-gray-500" />
                 <div>
                   <p className="text-sm text-gray-500">{t('events.dialog.view.createdBy')}</p>
                   <p className="text-sm">
                     {event.created_by.name} {event.created_by.lastname}
                   </p>
                   <p className="text-xs text-gray-500">{event.created_by.email}</p>
                 </div>
               </div>
             )}
             
             {/* Reports section */}
             {event && (
               <div className="space-y-4">
                 <div className="space-y-1">
                   <h3 className="text-xl font-semibold">{t('events.dialog.view.reports')}</h3>
                 </div>
                 
                 {/* Report buttons container */}
                 <div className="flex items-start space-x-2">
                    {/* Billing summary button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchBillingSummary}
                      disabled={billingSummaryLoading}
                      aria-label={t('events.dialog.view.billingSummaryLabel')}
                      {...(billingSummaryLoading ? { 'aria-busy': 'true' } : {})}
                    >
                      {billingSummaryLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PieChart className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {/* Musician payment summary button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchMusicianPaymentSummary}
                      disabled={musicianSummaryLoading}
                      aria-label={t('events.dialog.view.musicianPaymentSummaryLabel')}
                      {...(musicianSummaryLoading ? { 'aria-busy': 'true' } : {})}
                    >
                      {musicianSummaryLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </Button>
                 </div>
               </div>
             )}
           </div>
        ) : null}

        <DialogFooter>
          {canManageMusicians && (
            <Button type="button" variant="outline" onClick={handleManageMusicians} disabled={event?.status !== 'CONFIRMED'}>
              <Users className="h-4 w-4 mr-2" />
              {t('events.dialog.view.manageMusicians')}
            </Button>
          )}
          {myMusicianAssignment && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMyMusicianPayments(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {t('events.dialog.view.viewMyPayments')}
            </Button>
          )}
          {showEditButton && onEdit && canEditEvent && (
            <Button type="button" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('events.dialog.view.editEvent')}
            </Button>
          )}
          {/* Payment buttons - for event creator (non-admin) or admin */}
          {event && user && (isAdmin || (!isAdmin && event.user_id === user.id)) && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!event.price || event.price <= 0}
                onClick={() => setShowPaymentDetails(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('events.dialog.view.paymentDetails')}
              </Button>
            </>
          )}
          {/* Make Payment button - only for event creator (non-admin) */}
          {event && user && !isAdmin && event.user_id === user.id && (
            <>
              <Button
                type="button"
                disabled={!event.price || event.price <= 0}
                onClick={() => setShowMakePayment(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {t('events.dialog.view.makePayment')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {event && (
        <ViewPaymentDetailsDialog
        eventId={event.id}
        eventName={event.name}
        open={showPaymentDetails}
        onOpenChange={setShowPaymentDetails}
      />
    )}

    {/* Make Payment Dialog */}
    {event && user && (
      <MakePaymentDialog
        eventId={event.id}
        eventName={event.name}
        userId={user.id}
        open={showMakePayment}
        onOpenChange={setShowMakePayment}
      />
    )}

     {/* Personal Musician Payment Summary Dialog (for musician/auxiliar_musician/helper roles viewing their own assignment) */}
     {event && myMusicianAssignment && (
       <ViewMusicianPaymentsDialog
         eventId={event.id}
         musicianId={myMusicianAssignment.musician_id}
         musicianName={`${myMusicianAssignment.musician_name} ${myMusicianAssignment.musician_lastname}`}
         salary={myMusicianAssignment.salary}
         open={showMyMusicianPayments}
         onOpenChange={setShowMyMusicianPayments}
       />
     )}
     
     {/* Billing Summary Popup */}
     {event && (
       <div data-testid="billing-summary-popup" data-open={showBillingSummaryPopup}>
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
             <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowBillingSummaryPopup(false)}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             <h3 className="text-lg font-bold mb-4">{t('events.dialog.view.billingSummaryTitle')}</h3>
             {billingSummaryLoading ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="h-6 w-6 animate-spin" />
               </div>
             ) : billingSummaryError ? (
               <p className="text-red-600 text-center">{billingSummaryError}</p>
             ) : billingSummaryData ? (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.eventName')}</p>
                     <p className="text-xl font-semibold">{billingSummaryData.eventName}</p>
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.eventPrice')}</p>
                     <p className="text-xl font-semibold">{billingSummaryData.eventPrice.toFixed(2)}</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.paymentDone')}</p>
                     <p className={`
                       text-xl font-semibold ${ 
                         billingSummaryData.paymentDone < billingSummaryData.eventPrice 
                           ? 'text-amber-600' 
                           : billingSummaryData.paymentDone === billingSummaryData.eventPrice 
                             ? 'text-green-600' 
                             : 'text-red-600'
                       }
                     `}>
                       {billingSummaryData.paymentDone.toFixed(2)}
                     </p>
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.remainingPayment')}</p>
                     <p className={`
                       text-xl font-semibold ${ 
                         billingSummaryData.paymentDone < billingSummaryData.eventPrice 
                           ? 'text-red-600' 
                           : 'text-gray-600'
                       }
                     `}>
                       {billingSummaryData.remainingPayment.toFixed(2)}
                     </p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.sumOfMusicianSalaries')}</p>
                     <p className="text-xl font-semibold">{billingSummaryData.sumOfMusicianSalaries.toFixed(2)}</p>
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">{t('events.dialog.view.paymentDoneToMusicians')}</p>
                     <p className={`
                       text-xl font-semibold ${ 
                         billingSummaryData.sumOfMusicianSalaries > billingSummaryData.paymentDoneToMusicians 
                           ? 'text-amber-600' 
                           : billingSummaryData.sumOfMusicianSalaries === billingSummaryData.paymentDoneToMusicians 
                             ? 'text-green-600' 
                             : 'text-red-600'
                       }
                     `}>
                       {billingSummaryData.paymentDoneToMusicians.toFixed(2)}
                     </p>
                   </div>
                 </div>
               </div>
             ) : (
               <p className="text-center">{t('events.dialog.view.noData')}</p>
             )}
             <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setShowBillingSummaryPopup(false)}>
               {t('common.close')}
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Musician Payment Summary Popup */}
     {event && (
       <div data-testid="musician-summary-popup" data-open={showMusicianSummaryPopup}>
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
             <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowMusicianSummaryPopup(false)}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             <h3 className="text-lg font-bold mb-4">{t('events.dialog.view.musicianPaymentSummaryTitle')}</h3>
             {musicianSummaryLoading ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="h-6 w-6 animate-spin" />
               </div>
             ) : musicianSummaryError ? (
               <p className="text-red-600 text-center">{musicianSummaryError}</p>
             ) : musicianSummaryData && musicianSummaryData.length > 0 ? (
               <div className="space-y-4">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('events.dialog.view.musicianName')}</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('events.dialog.view.role')}</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('events.dialog.view.salary')}</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('events.dialog.view.paymentDone')}</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('events.dialog.view.remainingPayment')}</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {musicianSummaryData.map((musician, index) => (
                       <tr key={index} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {musician.musicianName}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {musician.role}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {musician.salary.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`
                             px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                               musician.paymentDone < musician.salary 
                                 ? 'bg-amber-100 text-amber-800'
                                 : musician.paymentDone === musician.salary
                                   ? 'bg-green-100 text-green-800'
                                   : 'bg-red-100 text-red-800'
                             }
                           `}>
                             {musician.paymentDone.toFixed(2)}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`
                             px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                               musician.paymentDone < musician.salary 
                                 ? 'bg-red-100 text-red-600'
                                 : 'bg-gray-100 text-gray-600'
                             }
                           `}>
                             {musician.remainingPayment.toFixed(2)}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {musicianSummaryData.length === 0 && (
                   <p className="text-center">{t('events.dialog.view.noData')}</p>
                 )}
               </div>
             ) : (
               <p className="text-center">{t('events.dialog.view.noData')}</p>
             )}
             <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setShowMusicianSummaryPopup(false)}>
               {t('common.close')}
             </button>
           </div>
         </div>
       </div>
     )}
     </Dialog>
  );
}
