// The one icon module. Every icon in the app comes from here, under a semantic name, so the
// family (Phosphor) can be swapped in one place. Rules: design-system.md, "Icons".
//
// - Default: regular weight, 20px, colour from the surrounding text (currentColor).
// - `weight="bold"` only where an icon is 16px or smaller (meta rows, inline checks).
// - `weight="fill"` only for the active navigation item or a selected state.
// - `weight="duotone"` only where the icon is the main visual (service tiles, empty states,
//   landing feature points), in coral on a coral-50 tile.
// Icons are decorative (aria-hidden) unless given `aria-label` or `titleAccess`.
import { forwardRef, type CSSProperties } from 'react';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import {
    AndroidLogoIcon,
    AppleLogoIcon,
    ArrowClockwiseIcon,
    ArrowCounterClockwiseIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowSquareOutIcon,
    ArrowUUpLeftIcon,
    BankIcon,
    BedIcon,
    BellIcon,
    BriefcaseIcon,
    BroomIcon,
    BuildingsIcon,
    CalendarBlankIcon,
    CalendarCheckIcon,
    CalendarPlusIcon,
    CalendarXIcon,
    CameraIcon,
    CaretDownIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CaretUpDownIcon,
    ChartBarIcon,
    ChatCircleIcon,
    ChatsCircleIcon,
    CheckCircleIcon,
    CheckIcon,
    ChecksIcon,
    CheckSquareIcon,
    CircleIcon,
    ClipboardTextIcon,
    ClockCountdownIcon,
    ClockIcon,
    CopyIcon,
    CreditCardIcon,
    CrosshairSimpleIcon,
    DownloadSimpleIcon,
    EnvelopeSimpleIcon,
    EyeIcon,
    EyeSlashIcon,
    FileArrowUpIcon,
    FileTextIcon,
    FolderOpenIcon,
    GearSixIcon,
    GpsSlashIcon,
    HourglassMediumIcon,
    HouseIcon,
    IdentificationCardIcon,
    ImageIcon,
    InfoIcon as PhInfoIcon,
    ListIcon,
    ListMagnifyingGlassIcon,
    LockSimpleIcon,
    MapPinIcon,
    MapTrifoldIcon,
    MinusIcon,
    MinusSquareIcon,
    PencilSimpleIcon,
    DotsThreeVerticalIcon,
    FlagIcon,
    PaperclipIcon,
    PaperPlaneRightIcon,
    ProhibitIcon,
    PhoneIcon as PhPhoneIcon,
    PlayCircleIcon,
    PlusIcon,
    PrinterIcon,
    RadioButtonIcon,
    ReceiptIcon as PhReceiptIcon,
    SealCheckIcon,
    SealWarningIcon,
    SignOutIcon,
    SquareIcon,
    StarIcon as PhStarIcon,
    ShirtFoldedIcon,
    TrashIcon,
    UserCheckIcon,
    UserIcon,
    WalletIcon,
    WarningCircleIcon,
    WarningIcon as PhWarningIcon,
    XIcon,
    type Icon as PhosphorIcon,
    type IconProps as PhosphorIconProps,
    type IconWeight,
} from '@phosphor-icons/react';

export type { IconWeight };

/** MUI-style size keywords; MUI passes these to icons it renders itself (checkbox, alert). */
type IconFontSize = 'inherit' | 'small' | 'medium' | 'large';
const FONT_SIZE: Record<IconFontSize, string> = {
    inherit: 'inherit',
    small: '1.25rem',
    medium: '1.5rem',
    large: '2rem',
};

export interface AppIconProps extends Omit<PhosphorIconProps, 'size' | 'ref'> {
    /** Pixel size; wins over any container rule. Leave unset to follow the default or the container. */
    size?: number | string;
    fontSize?: IconFontSize;
    sx?: SxProps<Theme>;
    /** Accessible name; makes the icon visible to screen readers. */
    titleAccess?: string;
}

export type AppIcon = ReturnType<typeof icon>;

function icon(Glyph: PhosphorIcon, displayName: string) {
    // The svg is always 1em, so its size follows font-size: the 20px default below, a container's
    // `& svg { fontSize }`, or the `size` prop. MuiSvgIcon-root keeps theme rules that size
    // MUI icons (menu items, bottom navigation, buttons) applying to these too.
    const Root = styled(Glyph)({
        display: 'inline-block',
        flexShrink: 0,
        fontSize: '1.25rem',
        userSelect: 'none',
        verticalAlign: '-0.125em',
    });
    const Component = forwardRef<SVGSVGElement, AppIconProps>(function AppIcon(
        { size, fontSize, sx, titleAccess, className, style, weight = 'regular', ...rest },
        ref
    ) {
        const labelled = Boolean(titleAccess || rest['aria-label']);
        const sized: CSSProperties | undefined =
            size !== undefined ? { fontSize: size, ...style } : style;
        return (
            <Root
                ref={ref}
                size="1em"
                weight={weight}
                className={['MuiSvgIcon-root', className].filter(Boolean).join(' ')}
                style={sized}
                sx={[
                    fontSize ? { fontSize: FONT_SIZE[fontSize] } : {},
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
                alt={titleAccess}
                aria-hidden={labelled ? undefined : true}
                role={labelled ? 'img' : undefined}
                focusable="false"
                {...rest}
            />
        );
    });
    Component.displayName = displayName;
    return Component;
}

/* Services */
export const RoomAttendantIcon = icon(BedIcon, 'RoomAttendantIcon');
export const PublicAreaIcon = icon(BroomIcon, 'PublicAreaIcon');
export const LinenPorterIcon = icon(ShirtFoldedIcon, 'LinenPorterIcon');
export const ServiceIconFallback = icon(BriefcaseIcon, 'ServiceIconFallback');

/* Navigation and account */
export const HomeIcon = icon(HouseIcon, 'HomeIcon');
export const BookingsIcon = icon(CalendarCheckIcon, 'BookingsIcon');
export const AvailableOrdersIcon = icon(ListMagnifyingGlassIcon, 'AvailableOrdersIcon');
export const OrdersIcon = icon(ClipboardTextIcon, 'OrdersIcon');
export const EarningsIcon = icon(WalletIcon, 'EarningsIcon');
export const NotificationsIcon = icon(BellIcon, 'NotificationsIcon');
export const ProfileIcon = icon(UserIcon, 'ProfileIcon');
export const ProviderIcon = icon(BriefcaseIcon, 'ProviderIcon');
export const LogoutIcon = icon(SignOutIcon, 'LogoutIcon');
export const ExpandIcon = icon(CaretUpDownIcon, 'ExpandIcon');
export const MenuIcon = icon(ListIcon, 'MenuIcon');
export const CloseIcon = icon(XIcon, 'CloseIcon');
export const BackIcon = icon(ArrowLeftIcon, 'BackIcon');
export const ForwardIcon = icon(ArrowRightIcon, 'ForwardIcon');
export const ChevronDownIcon = icon(CaretDownIcon, 'ChevronDownIcon');
export const ChevronLeftIcon = icon(CaretLeftIcon, 'ChevronLeftIcon');
export const ChevronRightIcon = icon(CaretRightIcon, 'ChevronRightIcon');
export const ExternalLinkIcon = icon(ArrowSquareOutIcon, 'ExternalLinkIcon');

/* Actions */
export const AddIcon = icon(PlusIcon, 'AddIcon');
export const RemoveIcon = icon(MinusIcon, 'RemoveIcon');
export const CheckMarkIcon = icon(CheckIcon, 'CheckMarkIcon');
export const MarkAllReadIcon = icon(ChecksIcon, 'MarkAllReadIcon');
export const RefreshIcon = icon(ArrowClockwiseIcon, 'RefreshIcon');
export const RetryIcon = icon(ArrowCounterClockwiseIcon, 'RetryIcon');
export const CopyTextIcon = icon(CopyIcon, 'CopyTextIcon');
export const PrintIcon = icon(PrinterIcon, 'PrintIcon');
export const DeleteIcon = icon(TrashIcon, 'DeleteIcon');
export const DownloadIcon = icon(DownloadSimpleIcon, 'DownloadIcon');
export const UploadFileIcon = icon(FileArrowUpIcon, 'UploadFileIcon');
export const PhotoCameraIcon = icon(CameraIcon, 'PhotoCameraIcon');
export const ShowPasswordIcon = icon(EyeIcon, 'ShowPasswordIcon');
export const HidePasswordIcon = icon(EyeSlashIcon, 'HidePasswordIcon');

/* Booking details */
export const CalendarIcon = icon(CalendarBlankIcon, 'CalendarIcon');
export const TimeIcon = icon(ClockIcon, 'TimeIcon');
export const LocationIcon = icon(MapPinIcon, 'LocationIcon');
export const LocationOffIcon = icon(GpsSlashIcon, 'LocationOffIcon');
export const VenueIcon = icon(BuildingsIcon, 'VenueIcon');
export const CurrentLocationIcon = icon(CrosshairSimpleIcon, 'CurrentLocationIcon');
export const MapIcon = icon(MapTrifoldIcon, 'MapIcon');
export const EditIcon = icon(PencilSimpleIcon, 'EditIcon');
export const EmailIcon = icon(EnvelopeSimpleIcon, 'EmailIcon');
export const PhoneIcon = icon(PhPhoneIcon, 'PhoneIcon');
export const PersonIcon = icon(UserIcon, 'PersonIcon');
export const SecureIcon = icon(LockSimpleIcon, 'SecureIcon');
export const ReceiptIcon = icon(PhReceiptIcon, 'ReceiptIcon');
export const RatingIcon = icon(PhStarIcon, 'RatingIcon');
export const ChartIcon = icon(ChartBarIcon, 'ChartIcon');
export const TodayIcon = icon(CalendarCheckIcon, 'TodayIcon');
export const PayoutIcon = icon(BankIcon, 'PayoutIcon');
export const IdDocumentIcon = icon(IdentificationCardIcon, 'IdDocumentIcon');
export const DocumentIcon = icon(FileTextIcon, 'DocumentIcon');
export const SettingsIcon = icon(GearSixIcon, 'SettingsIcon');
export const FolderIcon = icon(FolderOpenIcon, 'FolderIcon');
export const ChatIcon = icon(ChatCircleIcon, 'ChatIcon');
export const ConversationsIcon = icon(ChatsCircleIcon, 'ConversationsIcon');
export const PhotoIcon = icon(ImageIcon, 'PhotoIcon');
export const SendIcon = icon(PaperPlaneRightIcon, 'SendIcon');
export const AttachIcon = icon(PaperclipIcon, 'AttachIcon');
export const BlockIcon = icon(ProhibitIcon, 'BlockIcon');
export const ReportIcon = icon(FlagIcon, 'ReportIcon');
export const MoreIcon = icon(DotsThreeVerticalIcon, 'MoreIcon');
export const AndroidIcon = icon(AndroidLogoIcon, 'AndroidIcon');
export const AppleIcon = icon(AppleLogoIcon, 'AppleIcon');

/* Status and feedback */
export const InfoIcon = icon(PhInfoIcon, 'InfoIcon');
export const ErrorIcon = icon(WarningCircleIcon, 'ErrorIcon');
export const WarningIcon = icon(PhWarningIcon, 'WarningIcon');
export const SuccessIcon = icon(CheckCircleIcon, 'SuccessIcon');
export const PendingIcon = icon(HourglassMediumIcon, 'PendingIcon');
export const VerifiedIcon = icon(SealCheckIcon, 'VerifiedIcon');
export const RejectedIcon = icon(SealWarningIcon, 'RejectedIcon');

/* Booking and payment events (notifications) */
export const BookingCreatedIcon = icon(CalendarPlusIcon, 'BookingCreatedIcon');
export const BookingAcceptedIcon = icon(UserCheckIcon, 'BookingAcceptedIcon');
export const BookingStartedIcon = icon(PlayCircleIcon, 'BookingStartedIcon');
export const BookingCancelledIcon = icon(CalendarXIcon, 'BookingCancelledIcon');
export const BookingExpiredIcon = icon(ClockCountdownIcon, 'BookingExpiredIcon');
export const PaymentIcon = icon(CreditCardIcon, 'PaymentIcon');
export const RefundIcon = icon(ArrowUUpLeftIcon, 'RefundIcon');

/* Form controls (used by the theme for MUI's own icons) */
export const CheckboxIcon = icon(SquareIcon, 'CheckboxIcon');
export const CheckboxCheckedIcon = icon(CheckSquareIcon, 'CheckboxCheckedIcon');
export const CheckboxIndeterminateIcon = icon(MinusSquareIcon, 'CheckboxIndeterminateIcon');
export const RadioIcon = icon(CircleIcon, 'RadioIcon');
export const RadioCheckedIcon = icon(RadioButtonIcon, 'RadioCheckedIcon');
