import { takeEvery, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator, SessionInvalidType } from './index';
import { Urls } from '../utils/urls';

export const AddTabType = 'add tab';

export const RemoveTabType = 'remove tab';

export const UpdateDisplayRecordType = 'update display record';

export const UpdateDisplayRecordPropertyType = 'update display record property';

export const ActiveTabType = 'active tab';

export const SendRequestType = 'send request';

export const SendRequestFulfilledType = 'send request fulfill';

export const CancelRequestType = 'cancel request';

export const SaveRecordType = 'save record';

export const SaveAsRecordType = 'save as record';

export const ActiveRecordType = 'active record';

export const DeleteRecordType = 'delete record';

export const MoveRecordType = 'move record';

export function* sendRequest() {
    yield takeEvery(SendRequestType, function* (action: any) {
        const value = action.value;
        let runResult: any = {};
        try {
            const res = yield call(RequestManager.post, Urls.getUrl(`record/run`), value);
            if (res.status === 403) {
                yield put(actionCreator(SessionInvalidType));
            }
            if (RequestManager.checkCanceledThenRemove(value.record.id)) {
                return;
            }
            runResult = yield res.json();
        } catch (err) {
            runResult.error = { message: err.message, stack: err.stack };
        }
        yield put(actionCreator(SendRequestFulfilledType, { id: value.record.id, cid: value.record.collectionId, runResult }));
    });
}

export function* saveRecord() {
    yield takeEvery(SaveRecordType, pushSaveRecordToChannel);
}

export function* saveAsRecord() {
    yield takeEvery(SaveAsRecordType, pushSaveRecordToChannel);
}

function* pushSaveRecordToChannel(action: any) {
    const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
    const channelAction = syncAction({ type: SaveRecordType, method: method, url: Urls.getUrl(`record`), body: action.value.record });
    yield put(channelAction);
}

export function* deleteRecord() {
    yield takeEvery(DeleteRecordType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteRecordType, method: HttpMethod.DELETE, url: Urls.getUrl(`record/${action.value.id}`) });
        yield put(channelAction);
    });
}

export function* moveRecord() {
    yield takeEvery(MoveRecordType, function* (action: any) {
        const channelAction = syncAction({ type: MoveRecordType, method: HttpMethod.PUT, url: Urls.getUrl(`record`), body: action.value.record });
        yield put(channelAction);
    });
}